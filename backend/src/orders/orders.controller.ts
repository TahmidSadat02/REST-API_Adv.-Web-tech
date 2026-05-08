import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtGuard)
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // req.user contains the decoded JWT payload from your JwtStrategy
    return this.ordersService.createOrder(createOrderDto, req.user);
  }
}