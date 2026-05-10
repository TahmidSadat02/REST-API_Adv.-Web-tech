import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Menu } from '../../menu/menu.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  // One category can have many menu items
  @OneToMany(() => Menu, (menu) => menu.category)
  menuItems!: Menu[];
}