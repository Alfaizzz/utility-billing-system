import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConnectionType } from './customer.entity';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'connection_type',
    type: 'enum',
    enum: ConnectionType,
  })
  connectionType!: ConnectionType;

  @Column({ name: 'rate_per_unit', type: 'decimal', precision: 10, scale: 2 })
  ratePerUnit!: number;

  @Column({
    name: 'fixed_charge',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  fixedCharge!: number;

  @Column({
    name: 'tax_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  taxPercentage!: number;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom!: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
