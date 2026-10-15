import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { AiModule } from './ai/ai.module';
import { PrismaModule } from './prisma/prisma.module'; 
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Đọc .env. isGlobal: Module nào cũng dùng được ConfigService
    PrismaModule,
    ProductModule,
    AiModule,
    AuthModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
