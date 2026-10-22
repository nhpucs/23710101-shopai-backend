import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  let controller: OrderController;
  const orderService = { createOrder: jest.fn(), getOrdersForUser: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: orderService }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('lấy userId từ req.user (do JwtAuthGuard gắn), không tin userId trong body', async () => {
    const dto = { items: [{ productId: '1', quantity: 1 }], total: 1 };
    await controller.create(dto, { user: { userId: 'u_001' } });

    expect(orderService.createOrder).toHaveBeenCalledWith(dto, 'u_001');
  });
});
