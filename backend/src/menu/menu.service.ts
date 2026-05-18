import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async create(createMenuDto: CreateMenuDto) {
    
    const { categoryId, ...rest } = createMenuDto;

    
    const newItem = this.menuRepository.create(rest);

    
    if (categoryId) {
      newItem.category = { id: categoryId } as any; 
    }

    return await this.menuRepository.save(newItem);
  }

  async findAll(): Promise<Menu[]> {
    return await this.menuRepository.find({ relations: ['category'] });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    
    const { categoryId, ...rest } = updateMenuDto;

    const menuItem = await this.menuRepository.findOne({ where: { id } });

    if (!menuItem) {
      throw new NotFoundException(`Menu item #${id} not found`);
    }

    
    Object.assign(menuItem, rest);

    
    if (categoryId !== undefined) {
      menuItem.category = categoryId === '' ? null : ({ id: categoryId } as any);
    }

    
    await this.menuRepository.save(menuItem);

    
    return await this.menuRepository.findOne({
      where: { id },
      relations: ['category'],
    }) as Menu;
  }


  async remove(id: string, force: boolean = false): Promise<void> {
    
    
    const menuItem = await this.menuRepository.findOne({ 
      where: { id },
      withDeleted: true 
    });
    
    if (!menuItem) {
      throw new NotFoundException(`Menu item #${id} not found`);
    }

    if (force) {
      try {
        
        await this.menuRepository.remove(menuItem);
      } catch (error) {
        throw new ConflictException(
          'Cannot force delete this item because it is tied to an existing customer order.'
        );
      }
    } else {
      
      await this.menuRepository.softRemove(menuItem);
    }
  }
}