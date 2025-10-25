import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Info')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'API Info',
    description: 'Informações básicas da API'
  })
  @ApiResponse({
    status: 200,
    description: 'Informações da API',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Producer Manager API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string', example: 'Brain Agriculture - Producer Management System API' },
        environment: { type: 'string', example: 'development' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  getInfo() {
    return this.appService.getInfo();
  }
}
