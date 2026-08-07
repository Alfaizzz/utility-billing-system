import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customer.module';
import { MetersModule } from './meters/meters.module';
import { TariffsModule } from './tariffs/tariffs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmConfig,
    }),
    AuthModule,
    CustomersModule,
    MetersModule,
    TariffsModule,
  ],
})
export class AppModule {}
