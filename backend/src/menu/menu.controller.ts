import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Delete,
  Query
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { AuthGuard } from '@nestjs/passport'; 
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UserRole } from '../user/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiBearerAuth() 
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get()
  async getMenu() {
    return await this.menuService.findAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async addMenuItem(@Body() createMenuDto: CreateMenuDto) {
    return await this.menuService.create(createMenuDto);
  }

  
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('force') force?: string) {
    const isForceDelete = force === 'true';
    return this.menuService.remove(id, isForceDelete);
  }
}