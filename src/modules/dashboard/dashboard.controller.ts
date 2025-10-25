import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService, DashboardStats } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas do dashboard',
    description:
      'Retorna estatísticas completas para o dashboard incluindo total de fazendas, área por estado, uso do solo e distribuição de culturas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas obtidas com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalFazendas: { type: 'number', example: 150 },
        totalAreaHectares: { type: 'number', example: 75000.5 },
        totalProdutores: { type: 'number', example: 45 },
        areaPorEstado: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              estado: { type: 'string', example: 'SP' },
              area: { type: 'number', example: 25000.0 },
              fazendas: { type: 'number', example: 50 },
            },
          },
        },
        areaPorCultura: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cultura: { type: 'string', example: 'Soja' },
              area: { type: 'number', example: 15000.0 },
              percentual: { type: 'number', example: 35.5 },
            },
          },
        },
        usoSolo: {
          type: 'object',
          properties: {
            areaAgricultavel: { type: 'number', example: 45000.0 },
            areaVegetacao: { type: 'number', example: 30000.5 },
            percentualAgricultavel: { type: 'number', example: 60.0 },
            percentualVegetacao: { type: 'number', example: 40.0 },
          },
        },
      },
    },
  })
  async getStats(): Promise<DashboardStats> {
    return await this.dashboardService.getStats();
  }
}
