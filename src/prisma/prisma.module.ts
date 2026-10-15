import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Mọi Module khác (Order, Auth...) dùng được PrismaService mà không phải import lại
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
