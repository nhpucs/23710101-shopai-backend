import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Chương 11 (Phần 11.15): Unit Test AuthService — mock Prisma + JwtService, không đụng SQLite thật
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };

  // Mật khẩu đã hash giống seed Chương 9 (demo@shopai.com / 123456)
  const passwordHash = bcrypt.hashSync('123456', 10);
  const demoUser = {
    id: 'u_001',
    email: 'demo@shopai.com',
    name: 'Demo',
    password: passwordHash,
  };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
    jwtService = { sign: jest.fn().mockReturnValue('fake.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService }, // Không cần JWT_SECRET thật
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('trả về accessToken khi email và mật khẩu đều đúng', async () => {
      prisma.user.findUnique.mockResolvedValue(demoUser);

      const result = await service.login({ email: 'demo@shopai.com', password: '123456' });

      expect(result.accessToken).toBe('fake.jwt.token');
      expect(result.user).toEqual({ id: 'u_001', email: 'demo@shopai.com', name: 'Demo' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'u_001', email: 'demo@shopai.com' });
    });

    it('KHÔNG trả mật khẩu đã hash ra ngoài', async () => {
      prisma.user.findUnique.mockResolvedValue(demoUser);

      const result = await service.login({ email: 'demo@shopai.com', password: '123456' });

      expect(result.user).not.toHaveProperty('password');
    });

    it('ném UnauthorizedException khi email không tồn tại', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'khong_ton_tai@shopai.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('ném UnauthorizedException khi sai mật khẩu', async () => {
      prisma.user.findUnique.mockResolvedValue(demoUser);

      await expect(
        service.login({ email: 'demo@shopai.com', password: 'sai_mat_khau' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    // Ở bản Chương 9, validateUser trả null (chưa ném lỗi) — login mới đổi null thành 401
    it('trả null khi email không tồn tại', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('x@shopai.com', '123456')).resolves.toBeNull();
    });

    it('trả null khi sai mật khẩu', async () => {
      prisma.user.findUnique.mockResolvedValue(demoUser);
      await expect(service.validateUser('demo@shopai.com', 'sai_mat_khau')).resolves.toBeNull();
    });
  });

  describe('register', () => {
    it('ném ConflictException (409) khi email đã được đăng ký', async () => {
      prisma.user.findUnique.mockResolvedValue(demoUser);

      await expect(
        service.register({ email: 'demo@shopai.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('lưu mật khẩu đã hash bằng bcrypt, không lưu chữ thường', async () => {
      // Lần 1: kiểm tra trùng email -> chưa có. Lần 2: login ngay sau khi tạo -> tìm thấy
      prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(demoUser);
      prisma.user.create.mockResolvedValue(demoUser);

      await service.register({ email: 'demo@shopai.com', password: '123456' });

      const saved = prisma.user.create.mock.calls[0][0].data.password as string;
      expect(saved).not.toBe('123456');
      expect(bcrypt.compareSync('123456', saved)).toBe(true);
    });
  });
});
