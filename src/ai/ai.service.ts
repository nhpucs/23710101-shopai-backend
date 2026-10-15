import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Content,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { SHOPAI_SYSTEM_PROMPT } from './ai.prompt';
import { getQuickAnswer } from './quick-answers';

export type ChatHistoryItem = { role: 'user' | 'model'; text: string };

@Injectable()
export class AiService {
  private readonly model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    // Thiếu key thì báo lỗi rõ ngay lúc khởi động, thay vì chờ tới khi có người chat mới vỡ
    if (!apiKey) {
      throw new Error(
        'Thiếu GEMINI_API_KEY trong file .env của shopai-backend',
      );
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel(
      {
        model: 'gemini-flash-lite-latest',
        systemInstruction: SHOPAI_SYSTEM_PROMPT,
        generationConfig: { temperature: 0.4, maxOutputTokens: 400, topP: 0.9 },
      },
      { timeout: 15000 }, // Gemini quá 15 giây không trả lời -> báo lỗi, không treo
    );
  }

  async chat(
    message: string,
    history: ChatHistoryItem[] = [],
  ): Promise<string> {
    // Làn nhanh: câu quen thuộc (giá, ship, bảo hành, cảm ơn) trả lời ngay, không tốn quota Gemini
    const quick = getQuickAnswer(message);
    if (quick) {
      return quick;
    }

    // Làn AI — đổi { role, text } từ Mobile thành định dạng Gemini Content[]; chỉ giữ 10 lượt gần nhất
    const geminiHistory: Content[] = history.slice(-10).map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));
    // Gemini bắt buộc lịch sử mở đầu bằng lượt 'user'
    while (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
      geminiHistory.shift();
    }

    const chat = this.model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    return result.response.text().trim();
  }
}
