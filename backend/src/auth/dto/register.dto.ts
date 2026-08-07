import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ConnectionType } from '../../entities/customer.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the customer',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Unique email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '9876543210', description: '10-digit mobile number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'mobileNumber must be a valid 10-digit number',
  })
  mobileNumber!: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special char)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password!: string;

  @ApiProperty({ example: '123 Main Street', description: 'Street address' })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Noida', description: 'City' })
  @IsNotEmpty()
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Uttar Pradesh', description: 'State' })
  @IsNotEmpty()
  @IsString()
  state!: string;

  @ApiProperty({ example: '201301', description: 'Postal Pincode' })
  @IsNotEmpty()
  @IsString()
  pincode!: string;

  @ApiPropertyOptional({
    enum: ConnectionType,
    example: ConnectionType.DOMESTIC,
  })
  @IsOptional()
  @IsEnum(ConnectionType)
  connectionType?: ConnectionType;
}
