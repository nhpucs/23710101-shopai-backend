import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PRODUCTS } from './../src/product/product.data';

// Chương 11 (Phần 11.15 mục 4): gọi HTTP thật vào toàn bộ App Nest dựng trong RAM.
// Dùng DB dev đã seed ở Chương 9 (demo@shopai.com / 123456).
describe('Auth + Orders (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string; // Token lấy ở nhóm Login, nhóm Orders dùng lại

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // TestingModule không đọc main.ts -> phải bật lại ValidationPipe giống hệt main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close(); // Thiếu dòng này Jest treo, không tự thoát
  });

  describe('POST /api/auth/login', () => {
    it('trả về 200 kèm accessToken khi đăng nhập đúng', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'demo@shopai.com', password: '123456' });

      // ShopAI đặt @HttpCode(200) cho login (đăng nhập không "tạo mới" gì) nên không phải 201
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
      accessToken = res.body.accessToken;
    });

    it('trả về 401 khi sai mật khẩu', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'demo@shopai.com', password: 'sai_mat_khau' });

      expect(res.status).toBe(401);
    });

    it('trả về 400 khi email sai định dạng (ValidationPipe chặn trước khi vào AuthService)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'khong-phai-email', password: '123456' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/orders (bảo vệ bằng JwtAuthGuard)', () => {
    const product = PRODUCTS[0];
    const validOrder = {
      items: [{ productId: product.id, quantity: 2 }],
      total: product.price * 2,
    };

    it('trả về 401 khi KHÔNG gửi kèm Token', async () => {
      const res = await request(app.getHttpServer()).post('/api/orders').send(validOrder);
      expect(res.status).toBe(401);
    });

    it('trả về 401 khi gửi Token giả mạo', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', 'Bearer token_gia_mao_khong_hop_le')
        .send(validOrder);

      expect(res.status).toBe(401);
    });

    it('trả về 201 khi gửi kèm Token hợp lệ, Server tự tính đúng tổng tiền', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validOrder);

      expect(res.status).toBe(201);
      expect(res.body.id).toEqual(expect.stringContaining('ORD-'));
      expect(res.body.status).toBe('PENDING');
      expect(res.body.total).toBe(product.price * 2);
    });

    it('trả về 400 khi tổng tiền bị sửa (gian lận)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validOrder, total: 1000 });

      expect(res.status).toBe(400);
    });
  });
});
