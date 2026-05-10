import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

@Entity('menu_items')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 5, scale: 2 })
  price!: number;

  @ManyToOne(() => Category, (category) => category.menuItems, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category | undefined;

  @Column({ default: true })
  isAvailable!: boolean;
}
