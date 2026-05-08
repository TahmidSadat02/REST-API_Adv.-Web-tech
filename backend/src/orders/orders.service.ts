import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Menu } from '../menu/menu.entity';
import { MailService } from '../mail/mail.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Menu) private menuRepository: Repository<Menu>,
    private mailService: MailService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user: any) {
    let totalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const itemDto of createOrderDto.items) {
      const menuItem = await this.menuRepository.findOne({ where: { id: itemDto.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Item ${itemDto.menuItemId} not found`);

      const orderItem = new OrderItem();
      orderItem.menuItem = menuItem;
      orderItem.quantity = itemDto.quantity;
      orderItem.unitPrice = menuItem.price;
      
      totalPrice += menuItem.price * itemDto.quantity;
      orderItems.push(orderItem);
    }

    
    const order = this.orderRepository.create({
      customer: { id: user.userId },
      totalPrice,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    
    this.mailService.sendOrderConfirmation(user.email, user.fullName || 'Customer', savedOrder.id, totalPrice)
      .catch(err => console.error('Failed to send order email:', err));

    return savedOrder;
  }
}