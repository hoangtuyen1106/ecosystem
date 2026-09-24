import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  async getHealth() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000); //seconds
    const memUsage = process.memoryUsage();

    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime,
      memory: {
        total: Math.round(memUsage.heapTotal / 1024 / 1024), //MB
        used: Math.round(memUsage.heapUsed / 1024 / 1024), //MB
      },
      services: {
        auth: 'UP',
        orders: 'UP',
        users: 'UP',
        products: 'UP',
      },
    };
  }
}
