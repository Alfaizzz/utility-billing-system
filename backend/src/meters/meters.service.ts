import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meter, MeterStatus } from '../entities/meter.entity';
import { Customer } from '../entities/customer.entity';
import { AssignMeterDto } from './dto/assign-meter.dto';
import { QueryMeterDto } from './dto/query-meter.dto';

@Injectable()
export class MetersService {
  constructor(
    @InjectRepository(Meter)
    private readonly meterRepository: Repository<Meter>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // API-06: Assign Meter to Customer
  async assignMeter(dto: AssignMeterDto) {
    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException({
        message: 'Customer not found',
        errorCode: 'CUSTOMER_NOT_FOUND',
      });
    }

    const existingMeterNumber = await this.meterRepository.findOne({
      where: { meterNumber: dto.meterNumber },
    });

    if (existingMeterNumber) {
      throw new ConflictException({
        message: 'Meter number already registered',
        errorCode: 'DUPLICATE_METER_NUMBER',
      });
    }

    const activeMeter = await this.meterRepository.findOne({
      where: { customerId: dto.customerId, status: MeterStatus.ACTIVE },
    });

    if (activeMeter) {
      throw new ConflictException({
        message: 'Customer already has an active meter assigned',
        errorCode: 'ACTIVE_METER_EXISTS',
      });
    }

    const meter = this.meterRepository.create({
      customerId: dto.customerId,
      meterNumber: dto.meterNumber,
      utilityType: dto.utilityType,
      installationDate: dto.installationDate
        ? new Date(dto.installationDate)
        : new Date(),
      status: MeterStatus.ACTIVE,
    });

    const savedMeter = await this.meterRepository.save(meter);

    return {
      meterId: savedMeter.id,
      meterNumber: savedMeter.meterNumber,
      customerId: savedMeter.customerId,
      utilityType: savedMeter.utilityType,
      installationDate: savedMeter.installationDate,
      status: savedMeter.status,
    };
  }

  // API-07: Get Meters List with Pagination
  async getMeters(query: QueryMeterDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.meterRepository
      .createQueryBuilder('m')
      .innerJoinAndSelect('m.customer', 'c')
      .innerJoinAndSelect('c.user', 'u')
      .orderBy('m.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('m.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(m.meterNumber ILIKE :search OR c.customerNumber ILIKE :search OR u.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [meters, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = meters.map((m) => ({
      meterId: m.id,
      meterNumber: m.meterNumber,
      customerId: m.customerId,
      customerNumber: m.customer.customerNumber,
      customerName: m.customer.user.name,
      utilityType: m.utilityType,
      status: m.status,
      installationDate: m.installationDate,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
