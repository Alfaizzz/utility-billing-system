import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetersService } from './meters.service';
import { AssignMeterDto } from './dto/assign-meter.dto';
import { QueryMeterDto } from './dto/query-meter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Admin Meter Management (API-06, API-07)')
@ApiBearerAuth('JWT-auth')
@Controller('api/admin/meters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'API-06: Assign Meter to Customer' })
  async assignMeter(@Body() dto: AssignMeterDto) {
    const data = await this.metersService.assignMeter(dto);
    return {
      message: 'Meter assigned successfully',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API-07: Get Meters List' })
  async getMeters(@Query() query: QueryMeterDto) {
    const { data, meta } = await this.metersService.getMeters(query);
    return {
      message: 'Meters fetched successfully',
      data,
      meta,
    };
  }
}
