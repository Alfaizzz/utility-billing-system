import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  Matches,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConnectionType } from '../../entities/customer.entity';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'mobileNumber must be a valid 10-digit number',
  })
  mobileNumber!: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Noida' })
  @IsNotEmpty()
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Uttar Pradesh' })
  @IsNotEmpty()
  @IsString()
  state!: string;

  @ApiProperty({ example: '201301' })
  @IsNotEmpty()
  @IsString()
  pincode!: string;

  @ApiProperty({ enum: ConnectionType, example: ConnectionType.DOMESTIC })
  @IsNotEmpty()
  @IsEnum(ConnectionType)
  connectionType!: ConnectionType;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  connectionDate?: string;
}
