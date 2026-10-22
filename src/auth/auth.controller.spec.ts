import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { login: jest.fn(), register: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login chuyển nguyên DTO xuống AuthService', async () => {
    authService.login.mockResolvedValue({ accessToken: 't' });
    const dto = { email: 'demo@shopai.com', password: '123456' };

    await expect(controller.login(dto)).resolves.toEqual({ accessToken: 't' });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });
});
