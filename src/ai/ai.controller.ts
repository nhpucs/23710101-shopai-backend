import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { AiService, ChatHistoryItem } from './ai.service';

@ApiTags('Ai')
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { message: string; history?: ChatHistoryItem[] }) {
    const reply = await this.aiService.chat(body.message, body.history ?? []);
    return { reply };
  }
}

