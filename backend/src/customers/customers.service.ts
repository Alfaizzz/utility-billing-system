import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from '../entities/customer.entity';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  // API-03: Create Customer (Admin Only)
  async createCustomer(dto: CreateCustomerDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { mobileNumber: dto.mobileNumber }],
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException({
          message: 'Email already exists',
          errorCode: 'DUPLICATE_EMAIL',
        });
      }
      if (existingUser.mobileNumber === dto.mobileNumber) {
        throw new ConflictException({
          message: 'Mobile number already exists',
          errorCode: 'DUPLICATE_MOBILE',
        });
      }
    }

    const defaultPassword = 'Password@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        name: dto.name,
        email: dto.email,
        mobileNumber: dto.mobileNumber,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      });
      const savedUser = await queryRunner.manager.save(user);

      const count = await queryRunner.manager.count(Customer);
      const customerNumber = `CUS-${100001 + count}`;

      const customer = queryRunner.manager.create(Customer, {
        userId: savedUser.id,
        customerNumber,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        connectionType: dto.connectionType,
        connectionDate: dto.connectionDate
          ? new Date(dto.connectionDate)
          : new Date(),
        status: 'ACTIVE',
      });
      const savedCustomer = await queryRunner.manager.save(customer);

      await queryRunner.commitTransaction();

      return {
        customerId: savedCustomer.id,
        customerNumber: savedCustomer.customerNumber,
        name: savedUser.name,
        email: savedUser.email,
        mobileNumber: savedUser.mobileNumber,
        connectionType: savedCustomer.connectionType,
        status: savedCustomer.status,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // API-04: Get Paginated Customers List & Search
  async getCustomers(query: QueryCustomerDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.user', 'u')
      .orderBy('c.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('c.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(u.name ILIKE :search OR u.email ILIKE :search OR u.mobileNumber ILIKE :search OR c.customerNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [customers, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = customers.map((c) => ({
      customerId: c.id,
      customerNumber: c.customerNumber,
      name: c.user.name,
      email: c.user.email,
      mobileNumber: c.user.mobileNumber,
      connectionType: c.connectionType,
      status: c.status,
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

  // API-05: Get Customer Details
  async getCustomerDetails(customerId: string) {
    const customer = await this.customerRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.user', 'u')
      .where('c.id = :customerId', { customerId })
      .getOne();

    if (!customer) {
      throw new NotFoundException({
        message: 'Customer not found',
        errorCode: 'CUSTOMER_NOT_FOUND',
      });
    }

    return {
      customerId: customer.id,
      customerNumber: customer.customerNumber,
      name: customer.user.name,
      email: customer.user.email,
      mobileNumber: customer.user.mobileNumber,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      connectionType: customer.connectionType,
      status: customer.status,
    };
  }
}
