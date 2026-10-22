import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

describe('AiService', () => {
  const makeModule = (apiKey: string | undefined) =>
    Test.createTestingModule({
      providers: [AiService, { provide: ConfigService, useValue: { get: jest.fn(() => apiKey) } }],
    }).compile();

  it('báo lỗi ngay lúc khởi động nếu thiếu GEMINI_API_KEY', async () => {
    await expect(makeModule(undefined)).rejects.toThrow('GEMINI_API_KEY');
  });

  describe('chat', () => {
    let service: AiService;

    beforeEach(async () => {
      const module: TestingModule = await makeModule('fake-key-chi-dung-khi-test');
      service = module.get<AiService>(AiService);
    });

    it('câu cảm ơn trả lời ngay bằng làn nhanh, không cần gọi Gemini', async () => {
      // Key giả -> nếu lỡ gọi Gemini thật thì test sẽ đỏ, nên PASS nghĩa là đã đi làn nhanh
      await expect(service.chat('cảm ơn shop')).resolves.toContain('không có gì');
    });

    it('hỏi chính sách bảo hành trả lời từ dữ liệu có sẵn', async () => {
      await expect(service.chat('bảo hành thế nào?')).resolves.toContain('bảo hành');
    });
  });
});
