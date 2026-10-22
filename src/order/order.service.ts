import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import type { IOrderRepository } from './order.repository'; // interface chỉ có lúc viết code -> phải "import type" (isolatedModules + decorator metadata)

@Injectable()
export class OrderService {
  constructor(
    private readonly productService: ProductService,
    // Tiêm qua token chuỗi 'IOrderRepository' (khai báo ở order.module.ts) chứ không tiêm thẳng Class —
    // cho phép đổi triển khai (Prisma/In-memory) mà không sửa dòng nào ở đây.
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    let serverTotal = 0;
    const enrichedItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of dto.items) {
      const product = this.productService.findRawById(item.productId);
      if (!product) {
        throw new BadRequestException(`Sản phẩm ${item.productId} không còn tồn tại`);
      }
      serverTotal += product.price * item.quantity; // Giá lấy từ KHO CỦA SERVER, không lấy từ Client
      enrichedItems.push({ ...item, price: product.price });
    }

    // Đối chiếu với con số Mobile gửi lên (Phần 9.12 mục 2)
    if (serverTotal !== dto.total) {
      throw new BadRequestException(
        `Tổng tiền không khớp. Server tính ${serverTotal}, Client gửi ${dto.total}. Vui lòng tải lại giỏ hàng.`,
      );
    }

    return this.orderRepository.save({
      id: `ORD-${Date.now()}`, // Thực tế nên dùng uuid; Date.now() đủ dùng cho lớp học
      userId, // Biết chính xác đơn này của ai, lấy từ req.user do JwtAuthGuard gắn vào
      total: serverTotal, // Luôn ghi con số của SERVER
      items: enrichedItems,
    });
  }

  async getOrdersForUser(userId: string) {
    return this.orderRepository.findByUserId(userId);
  }

  async getOrderForUser(orderId: string, userId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Không tìm thấy hóa đơn');
    }
    return order;
  }

  async payOrder(orderId: string, userId: string) {
    const order = await this.getOrderForUser(orderId, userId);
    if (order.status === 'PAID') {
      return order; // Idempotent — bấm Pay lần 2 không lỗi
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException(`Không thể thanh toán đơn ở trạng thái ${order.status}`);
    }
    // Giả lập cổng thanh toán (Momo/VNPay/Stripe) — Production sẽ verify webhook
    return this.orderRepository.updateStatus(orderId, 'PAID');
  }

  async getAllOrders() {
    return this.orderRepository.findAll();
  }
}
