import { Body, Controller, Get, Post } from '@nestjs/common';
import { CekBotService } from './cekbot.service';
import type { CekBotMessageRequest } from './cekbot.types';

@Controller('cekbot')
export class CekBotController {
  constructor(private readonly cekBotService: CekBotService) {}

  @Get('status')
  status() {
    return this.cekBotService.getStatus();
  }

  @Post('messages')
  message(@Body() payload: CekBotMessageRequest) {
    return this.cekBotService.createReply(payload);
  }
}
