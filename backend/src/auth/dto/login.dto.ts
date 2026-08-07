import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@utility.com',
    description: 'Email address of admin or customer',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin@123', description: 'Account password' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
