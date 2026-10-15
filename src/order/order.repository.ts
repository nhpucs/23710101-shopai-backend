import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateOrderInput {
  id: string;
  userId: string;
  total: number;
  items: { productId: string; quantity: number; price: number }[];
}

export interface OrderRecord {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: Date;
  items: { productId: string; quantity: number; price: number }[];
}

// Bản hợp đồng GIỮ NGUYÊN như Phần 9.8 mục 5 — chỉ phần triển khai bên dưới là mới
export interface IOrderRepository {
  save(input: CreateOrderInput): Promise<OrderRecord>;
  findAll(): Promise<OrderRecord[]>;
  findByUserId(userId: string): Promise<OrderRecord[]>;
  findById(orderId: string): Promise<OrderRecord | null>;
  updateStatus(orderId: string, status: string): Promise<OrderRecord>;
}

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(input: CreateOrderInput): Promise<OrderRecord> {
    // "items: { create: [...] }" tạo Order VÀ toàn bộ OrderItem con trong CÙNG một lệnh/transaction
    return this.prisma.order.create({
      data: {
        id: input.id,
        userId: input.userId,
        total: input.total,
        status: 'PENDING',
        items: { create: input.items },
      },
      include: { items: true }, // Trả kèm luôn danh sách items trong response
    });
  }

  async findAll(): Promise<OrderRecord[]> {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }, // Đơn mới nhất lên đầu
    });
  }

  async findByUserId(userId: string): Promise<OrderRecord[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orderId: string): Promise<OrderRecord | null> {
    return this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  }

  async updateStatus(orderId: string, status: string): Promise<OrderRecord> {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  }
}
