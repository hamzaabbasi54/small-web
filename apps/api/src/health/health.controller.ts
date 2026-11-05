import { Controller, Get } from '@nestjs/common';

// @Controller('health') registers GET /api/health (the global prefix adds /api).
@Controller('health')
export class HealthController {
  @Get()
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
