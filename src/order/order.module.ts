import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { OrderController } from './order.controller';
import { PrismaOrderRepository } from './order.repository';
import { OrderService } from './order.service';

@Module({
  imports: [ProductModule], // Mượn ProductService từ Module hàng xóm (PrismaModule đã @Global)
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: 'IOrderRepository', useClass: PrismaOrderRepository }, // Đổi useClass là đổi nguồn dữ liệu, không sửa OrderService/Controller
  ],
})
export class OrderModule {}
