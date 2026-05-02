import { Module } from '@nestjs/common';
import { AiEyeModule } from './ai-eye/ai-eye.module';

@Module({
  imports: [AiEyeModule],
})
export class AppModule {}
