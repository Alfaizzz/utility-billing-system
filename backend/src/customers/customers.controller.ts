/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Admin Customer Management (API-03, API-04, API-05)')
@ApiBearerAuth('JWT-auth')
@Controller('api/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'API-03: Create Customer (Admin Only)' })
  async createCustomer(@Body() dto: CreateCustomerDto) {
    const data = await this.customersService.createCustomer(dto);
    return {
      message: 'Customer created successfully',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API-04: Get Customers List with Pagination & Search',
  })
  async getCustomers(@Query() query: QueryCustomerDto) {
    const { data, meta } = await this.customersService.getCustomers(query);
    return {
      message: 'Customers fetched successfully',
      data,
      meta,
    };
  }

  @Get(':customerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API-05: Get Single Customer Details' })
  async getCustomerDetails(@Param('customerId') customerId: string) {
    const data = await this.customersService.getCustomerDetails(customerId);
    return {
      message: 'Customer details fetched successfully',
      data,
    };
  }
}
