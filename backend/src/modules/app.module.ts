import { Module } from '@nestjs/common';
import { AiEyeModule } from './ai-eye/ai-eye.module';
import { CekBotModule } from './cekbot/cekbot.module';

@Module({
  imports: [AiEyeModule, CekBotModule],
})
export class AppModule {}
