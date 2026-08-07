import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer, ConnectionType } from './customer.entity';

export enum MeterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REPLACED = 'REPLACED',
}

@Entity('meters')
export class Meter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'meter_number', type: 'varchar', length: 50, unique: true })
  meterNumber!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({
    name: 'utility_type',
    type: 'enum',
    enum: ConnectionType,
    default: ConnectionType.DOMESTIC,
  })
  utilityType!: ConnectionType;

  @Column({
    name: 'installation_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  installationDate!: Date;

  @Column({
    type: 'enum',
    enum: MeterStatus,
    default: MeterStatus.ACTIVE,
  })
  status!: MeterStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
}
