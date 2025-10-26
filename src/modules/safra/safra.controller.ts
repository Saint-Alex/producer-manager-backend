import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auditable } from '../../shared/interceptors/audit.interceptor';
import { CreateSafraDto } from './dto/create-safra.dto';
import { SafraResponseDto } from './dto/safra-response.dto';
import { UpdateSafraDto } from './dto/update-safra.dto';
import { SafraService } from './safra.service';

@ApiTags('Safras')
@Controller('safras')
export class SafraController {
  constructor(private readonly safraService: SafraService) {}

  @Post()
  @Auditable('Safra')
  @ApiOperation({
    summary: 'Criar nova safra',
    description: 'Cria uma nova safra para um ano específico',
  })
  @ApiBody({
    type: CreateSafraDto,
    examples: {
      'safra-soja': {
        summary: 'Safra Soja 2024/25',
        description: 'Safra de soja para uma propriedade específica',
        value: {
          nome: 'Safra Soja 2024/25',
          ano: 2024,
          propriedadeRuralId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      'safra-milho': {
        summary: 'Safra Milho 2024',
        description: 'Safra de milho safrinha',
        value: {
          nome: 'Safra Milho Safrinha 2024',
          ano: 2024,
          propriedadeRuralId: '987e6543-e21c-43d2-b456-123456789abc',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Safra criada com sucesso',
    type: SafraResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Safra para este ano já existe',
  })
  async create(@Body() createSafraDto: CreateSafraDto) {
    return this.safraService.create(createSafraDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as safras',
    description: 'Retorna todas as safras cadastradas ordenadas por ano (mais recente primeiro)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de safras retornada com sucesso',
    type: [SafraResponseDto],
  })
  async findAll() {
    return this.safraService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar safra por ID',
    description: 'Retorna uma safra específica com informações dos cultivos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da safra',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safra encontrada',
    type: SafraResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Safra não encontrada',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.safraService.findOne(id);
  }

  @Get('year/:year')
  @ApiOperation({
    summary: 'Buscar safras por ano',
    description:
      'Retorna todas as safras de um ano específico (pode haver múltiplas por diferentes propriedades)',
  })
  @ApiParam({
    name: 'year',
    description: 'Ano da safra',
    type: 'number',
    example: 2024,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safras encontradas',
    type: [SafraResponseDto],
  })
  async findByYear(@Param('year', ParseIntPipe) year: number) {
    return this.safraService.findByYear(year);
  }

  @Get('propriedade/:propriedadeId')
  @ApiOperation({
    summary: 'Buscar safras por propriedade',
    description:
      'Retorna todas as safras de uma propriedade específica (pode ter múltiplas safras de anos diferentes)',
  })
  @ApiParam({
    name: 'propriedadeId',
    description: 'ID da propriedade rural',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safras encontradas',
    type: [SafraResponseDto],
  })
  async findByPropriedade(@Param('propriedadeId', ParseUUIDPipe) propriedadeId: string) {
    const safras = await this.safraService.findByPropriedade(propriedadeId);
    return safras;
  }

  @Patch(':id')
  @Auditable('Safra')
  @ApiOperation({
    summary: 'Atualizar safra',
    description: 'Atualiza parcialmente uma safra',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da safra',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safra atualizada com sucesso',
    type: SafraResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Safra não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Safra para este ano já existe',
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSafraDto: UpdateSafraDto) {
    return this.safraService.update(id, updateSafraDto);
  }

  @Delete(':id')
  @Auditable('Safra')
  @ApiOperation({
    summary: 'Remover safra',
    description: 'Remove uma safra do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da safra',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Safra removida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Safra não encontrada',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.safraService.remove(id);
  }
}
