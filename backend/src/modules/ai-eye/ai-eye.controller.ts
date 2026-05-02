import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiEyeService } from './ai-eye.service';

@Controller('ai-eye')
export class AiEyeController {
  constructor(private readonly aiEyeService: AiEyeService) {}

  @Post('screenings')
  create(@Body() payload: Record<string, unknown>) {
    return this.aiEyeService.createScreening(payload);
  }

  @Get('screenings')
  list() {
    return this.aiEyeService.getScreenings();
  }

  @Get('screenings/:id')
  detail(@Param('id') id: string) {
    return this.aiEyeService.getScreeningById(id);
  }
}
