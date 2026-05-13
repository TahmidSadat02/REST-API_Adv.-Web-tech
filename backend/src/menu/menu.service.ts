import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const newItem = this.menuRepository.create(createMenuDto);

    return await this.menuRepository.save(newItem);
  }

  async findAll(): Promise<Menu[]> {
    return await this.menuRepository.find({relations: ['category'],});
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menuItem = await this.menuRepository.findOne({ where: { id } });

    if (!menuItem) {
      throw new NotFoundException(`Menu item #${id} not found`);
    }

    Object.assign(menuItem, updateMenuDto);

    return this.menuRepository.save(menuItem);
  }

  async remove(id: string): Promise<void> {
    const menuItem = await this.menuRepository.findOne({ where: { id } });
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item #${id} not found`);
    }

    await this.menuRepository.remove(menuItem);
  }
}
