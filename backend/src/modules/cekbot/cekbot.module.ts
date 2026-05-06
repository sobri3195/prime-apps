import { Module } from '@nestjs/common';
import { CekBotController } from './cekbot.controller';
import { CekBotService } from './cekbot.service';

@Module({
  controllers: [CekBotController],
  providers: [CekBotService],
})
export class CekBotModule {}
