import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('api/orders')
@UseGuards(JwtAuthGuard) // Toàn bộ Orders API yêu cầu JWT — kể cả GET lịch sử
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post() // POST /api/orders → tạo đơn status PENDING
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.createOrder(dto, req.user.userId);
  }

  @Get() // GET /api/orders — lịch sử đơn CỦA user đang đăng nhập (không lộ đơn người khác)
  async findMine(@Req() req: any) {
    return this.orderService.getOrdersForUser(req.user.userId);
  }

  @Get(':id') // GET /api/orders/:id — chi tiết hóa đơn
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.orderService.getOrderForUser(id, req.user.userId);
  }

  @Post(':id/pay') // POST /api/orders/:id/pay — giả lập thanh toán PENDING → PAID
  async pay(@Param('id') id: string, @Req() req: any) {
    return this.orderService.payOrder(id, req.user.userId);
  }
}
