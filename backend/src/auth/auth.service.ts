import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
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

    const hashedPassword = await bcrypt.hash(dto.password, 10);

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
        status: 'ACTIVE',
      });
      const savedCustomer = await queryRunner.manager.save(customer);

      await queryRunner.commitTransaction();

      return {
        userId: savedUser.id,
        customerId: savedCustomer.id,
        customerNumber: savedCustomer.customerNumber,
        name: savedUser.name,
        email: savedUser.email,
        mobileNumber: savedUser.mobileNumber,
        role: savedUser.role,
        status: savedUser.status,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: { customer: true },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        message: 'User account is inactive',
        errorCode: 'UNAUTHORIZED',
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        errorCode: 'UNAUTHORIZED',
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customer?.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      userId: user.id,
      customerId: user.customer?.id || null,
      name: user.name,
      role: user.role,
      accessToken,
    };
  }
}
