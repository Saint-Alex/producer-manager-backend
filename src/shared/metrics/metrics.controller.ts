import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({
    summary: 'Métricas da aplicação',
    description: 'Retorna métricas de performance e uso da API',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas da aplicação',
    schema: {
      type: 'object',
      properties: {
        totalRequests: { type: 'number', example: 1542 },
        requestsByMethod: {
          type: 'object',
          example: { GET: 1200, POST: 280, PUT: 42, DELETE: 20 },
        },
        requestsByStatus: {
          type: 'object',
          example: { '200': 1450, '201': 280, '404': 10, '500': 2 },
        },
        averageResponseTime: { type: 'number', example: 125.5 },
        errorRate: { type: 'number', example: 0.8 },
        lastRequest: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 86400 },
        memory: {
          type: 'object',
          properties: {
            rss: { type: 'number' },
            heapTotal: { type: 'number' },
            heapUsed: { type: 'number' },
            external: { type: 'number' },
            arrayBuffers: { type: 'number' },
          },
        },
        environment: { type: 'string', example: 'production' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getMetrics(): any {
    return this.metricsService.getMetrics();
  }

  @Get('prometheus')
  @ApiOperation({
    summary: 'Métricas no formato Prometheus',
    description: 'Retorna métricas no formato text/plain compatível com Prometheus',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas no formato Prometheus',
    schema: {
      type: 'string',
      example: `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total 1542`,
    },
    headers: {
      'Content-Type': {
        description: 'text/plain; version=0.0.4; charset=utf-8',
        schema: { type: 'string' },
      },
    },
  })
  getPrometheusMetrics(): any {
    return {
      data: this.metricsService.getPrometheusMetrics(),
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    };
  }
}
