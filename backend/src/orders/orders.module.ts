import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Menu } from '../menu/menu.entity'; // Import Menu entity

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Menu])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}