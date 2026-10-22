import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { ProductService } from '../product/product.service';
import { PRODUCTS } from '../product/product.data';

// Chương 11: Unit Test công thức "Server tự tính lại tổng tiền" (Phần 9.12) — logic dính tới TIỀN
describe('OrderService', () => {
  let service: OrderService;
  let repo: {
    save: jest.Mock;
    findAll: jest.Mock;
    findByUserId: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
  };

  // Lấy giá thật trong kho, không viết cứng — đổi giá sản phẩm thì test vẫn đúng
  const [p1, p2] = PRODUCTS;

  beforeEach(async () => {
    repo = {
      save: jest.fn(input => Promise.resolve({ ...input, status: 'PENDING', createdAt: new Date() })),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        ProductService, // Dùng ProductService thật: nó chỉ đọc product.data.ts, không có DB
        { provide: 'IOrderRepository', useValue: repo },
      ],
    }).compile();

    service = module.get(OrderService);
  });

  describe('createOrder', () => {
    it('tạo đơn PENDING khi tổng tiền Client gửi khớp với Server tính', async () => {
      const total = p1.price * 2 + p2.price;

      const order = await service.createOrder(
        {
          items: [
            { productId: p1.id, quantity: 2 },
            { productId: p2.id, quantity: 1 },
          ],
          total,
        },
        'u_001',
      );

      expect(order.status).toBe('PENDING');
      expect(order.total).toBe(total);
      expect(order.userId).toBe('u_001');
      expect(order.id).toMatch(/^ORD-\d+$/);
    });

    it('ghi giá lấy từ KHO SERVER vào từng dòng hàng', async () => {
      await service.createOrder(
        { items: [{ productId: p1.id, quantity: 1 }], total: p1.price },
        'u_001',
      );

      const saved = repo.save.mock.calls[0][0];
      expect(saved.items[0]).toEqual({ productId: p1.id, quantity: 1, price: p1.price });
    });

    it('từ chối (400) khi Client gửi tổng tiền gian lận', async () => {
      await expect(
        service.createOrder({ items: [{ productId: p1.id, quantity: 1 }], total: 1000 }, 'u_001'),
      ).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('từ chối (400) khi sản phẩm không còn tồn tại', async () => {
      await expect(
        service.createOrder({ items: [{ productId: 'khong_co', quantity: 1 }], total: 0 }, 'u_001'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderForUser', () => {
    it('ném 404 khi xem đơn của người KHÁC (không lộ hoá đơn)', async () => {
      repo.findById.mockResolvedValue({ id: 'ORD-1', userId: 'u_khac', status: 'PENDING' });

      await expect(service.getOrderForUser('ORD-1', 'u_001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('payOrder', () => {
    it('chuyển PENDING -> PAID', async () => {
      repo.findById.mockResolvedValue({ id: 'ORD-1', userId: 'u_001', status: 'PENDING' });
      repo.updateStatus.mockResolvedValue({ id: 'ORD-1', userId: 'u_001', status: 'PAID' });

      const paid = await service.payOrder('ORD-1', 'u_001');

      expect(paid.status).toBe('PAID');
      expect(repo.updateStatus).toHaveBeenCalledWith('ORD-1', 'PAID');
    });

    it('bấm Pay lần 2 không lỗi và không cập nhật lại (idempotent)', async () => {
      repo.findById.mockResolvedValue({ id: 'ORD-1', userId: 'u_001', status: 'PAID' });

      const order = await service.payOrder('ORD-1', 'u_001');

      expect(order.status).toBe('PAID');
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });
});
