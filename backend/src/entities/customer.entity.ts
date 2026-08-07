import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ConnectionType {
  DOMESTIC = 'DOMESTIC',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    name: 'customer_number',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  customerNumber!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({ type: 'varchar', length: 50 })
  state!: string;

  @Column({ type: 'varchar', length: 10 })
  pincode!: string;

  @Column({
    name: 'connection_type',
    type: 'enum',
    enum: ConnectionType,
    default: ConnectionType.DOMESTIC,
  })
  connectionType!: ConnectionType;

  @Column({
    name: 'connection_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  connectionDate!: Date;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => User, (user) => user.customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
