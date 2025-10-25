import { Injectable } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class AppHealthService {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // Database connectivity
      () => this.db.pingCheck('database'),

      // Memory usage (less than 150MB RSS)
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),

      // Heap memory (less than 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      // Basic memory check (less than 500MB RSS)
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

      // Disk space check (at least 100MB free)
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9, // 90% usage threshold
        }),
    ]);
  }

  // Health check simples para compatibilidade
  getSimpleHealth() {
    return {
      status: 'ok',
      message: 'Producer Manager API is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    };
  }
}
