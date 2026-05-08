import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Menu } from '../../menu/menu.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @ManyToOne(() => Menu, menu => menu.id)
  menuItem!: Menu;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 5, scale: 2 })
  unitPrice!: number;
}