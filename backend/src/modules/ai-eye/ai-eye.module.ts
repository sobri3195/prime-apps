import { Module } from '@nestjs/common';
import { AiEyeController } from './ai-eye.controller';
import { AiEyeService } from './ai-eye.service';

@Module({
  controllers: [AiEyeController],
  providers: [AiEyeService],
})
export class AiEyeModule {}
