import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Bật để test qua Postman Web/Chrome hoặc phòng khi có Admin Web sau này — KHÔNG phải để "mở khóa" cho Mobile.

  // Trạm kiểm soát dữ liệu vào — áp dụng cho TOÀN BỘ endpoint
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Client gửi thừa field lạ -> tự động cắt bỏ
      forbidNonWhitelisted: true, // Gửi field lạ thì báo lỗi 400 luôn cho minh bạch
      transform: true, // Bật class-transformer: JSON -> instance DTO, tự ép kiểu
    }),
  );

  // "0.0.0.0" = lắng nghe TẤT CẢ card mạng (Wifi, LAN...) của máy tính.
  // Chỉ ghi app.listen(3000) -> mặc định có thể chỉ nhận kết nối từ chính máy này,
  // điện thoại thật cùng Wifi sẽ KHÔNG kết nối được dù IP đúng (Phần 9.4).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ShopAI API')
    .setDescription('Backend phục vụ App React Native ShopAI (Chương 9)')
    .setVersion('1.0')
    .addBearerAuth() // Hiện ô nhập JWT — dùng thật ngay ở đây vì Guard (Phần 9.7) đã hoạt động
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
