import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConnectionType } from '../../entities/customer.entity';

export class AssignMeterDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsNotEmpty()
  @IsUUID()
  customerId!: string;

  @ApiProperty({ example: 'MTR-884920' })
  @IsNotEmpty()
  @IsString()
  meterNumber!: string;

  @ApiProperty({ enum: ConnectionType, example: ConnectionType.DOMESTIC })
  @IsNotEmpty()
  @IsEnum(ConnectionType)
  utilityType!: ConnectionType;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  installationDate?: string;
}
