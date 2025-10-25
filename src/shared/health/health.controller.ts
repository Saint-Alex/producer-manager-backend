import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    HealthCheck,
    HealthCheckResult,
} from '@nestjs/terminus';
import { Request, Response } from 'express';
import { AppHealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: AppHealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check simples',
    description: 'Retorna status básico da aplicação para load balancers'
  })
  @ApiResponse({
    status: 200,
    description: 'API está funcionando',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'Producer Manager API is running successfully!' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        uptime: { type: 'number', example: 3600 },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number', example: 45 },
            total: { type: 'number', example: 128 },
            rss: { type: 'number', example: 89 }
          }
        }
      }
    }
  })
  getHealth(@Req() req: Request, @Res() res: Response) {
    const correlationId = req.headers['x-correlation-id'];
    if (correlationId) {
      res.setHeader('x-correlation-id', correlationId);
    }
    const healthData = this.healthService.getSimpleHealth();
    return res.json(healthData);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Verifica se a aplicação está pronta para receber tráfego (Kubernetes readiness probe)'
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação pronta',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação não está pronta'
  })
  checkReadiness(): Promise<HealthCheckResult> {
    return this.healthService.checkReadiness();
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Verifica se a aplicação está funcionando (Kubernetes liveness probe)'
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação funcionando',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação não está funcionando'
  })
  checkLiveness(): Promise<HealthCheckResult> {
    return this.healthService.checkLiveness();
  }
}
