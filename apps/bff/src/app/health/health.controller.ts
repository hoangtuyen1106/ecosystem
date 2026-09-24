import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health check')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Gateway is running',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2022-01-01T00:00:00.000Z',
        uptime: 3600,
        memory: {
          total: 512,
          used: 100,
        },
        services: {
          auth: 'UP',
          orders: 'UP',
          users: 'UP',
          products: 'UP',
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getHealth() {
    return await this.healthService.getHealth();
  }
}
