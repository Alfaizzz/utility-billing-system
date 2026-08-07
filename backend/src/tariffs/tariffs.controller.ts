import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TariffsService } from './tariffs.service';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Tariff Management (API-08, API-09)')
@Controller('api')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Post('admin/tariffs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'API-08: Create Tariff Plan (Admin Only)' })
  async createTariff(@Body() dto: CreateTariffDto) {
    const data = await this.tariffsService.createTariff(dto);
    return {
      message: 'Tariff created successfully',
      data,
    };
  }

  @Get('tariffs/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API-09: Get Active Tariffs' })
  async getActiveTariffs() {
    const data = await this.tariffsService.getActiveTariffs();
    return {
      message: 'Active tariffs fetched successfully',
      data,
    };
  }
}
