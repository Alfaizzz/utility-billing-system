import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConnectionType } from '../../entities/customer.entity';

export class CreateTariffDto {
  @ApiProperty({ enum: ConnectionType, example: ConnectionType.DOMESTIC })
  @IsNotEmpty()
  @IsEnum(ConnectionType)
  connectionType!: ConnectionType;

  @ApiProperty({ example: 6.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  ratePerUnit!: number;

  @ApiProperty({ example: 50.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fixedCharge!: number;

  @ApiProperty({ example: 5.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  taxPercentage!: number;

  @ApiProperty({ example: '2026-08-01' })
  @IsNotEmpty()
  @IsDateString()
  effectiveFrom!: string;
}
