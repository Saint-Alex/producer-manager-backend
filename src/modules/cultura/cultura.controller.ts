import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auditable } from '../../shared/interceptors/audit.interceptor';
import { CulturaService } from './cultura.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { CulturaResponseDto } from './dto/cultura-response.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';

@ApiTags('Culturas')
@Controller('culturas')
export class CulturaController {
  constructor(private readonly culturaService: CulturaService) {}

  @Post()
  @Auditable('Cultura')
  @ApiOperation({
    summary: 'Criar nova cultura',
    description: 'Cria uma nova cultura (ex: Soja, Milho, Algodão)',
  })
  @ApiBody({
    type: CreateCulturaDto,
    examples: {
      soja: {
        summary: 'Soja',
        description: 'Cultura de soja para grãos',
        value: {
          nome: 'Soja',
          descricao: 'Cultura oleaginosa para produção de grãos e óleo',
        },
      },
      milho: {
        summary: 'Milho',
        description: 'Cultura de milho',
        value: {
          nome: 'Milho',
          descricao: 'Cereal para alimentação humana e animal',
        },
      },
      cafe: {
        summary: 'Café',
        description: 'Cultura permanente de café',
        value: {
          nome: 'Café',
          descricao: 'Cultura permanente para produção de café arábica',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cultura criada com sucesso',
    type: CulturaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cultura com este nome já existe',
  })
  async create(@Body() createCulturaDto: CreateCulturaDto) {
    return this.culturaService.create(createCulturaDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as culturas',
    description: 'Retorna todas as culturas cadastradas',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de culturas retornada com sucesso',
    type: [CulturaResponseDto],
  })
  async findAll() {
    return this.culturaService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cultura por ID',
    description: 'Retorna uma cultura específica com informações dos cultivos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da cultura',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cultura encontrada',
    type: CulturaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cultura não encontrada',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.culturaService.findOne(id);
  }

  @Patch(':id')
  @Auditable('Cultura')
  @ApiOperation({
    summary: 'Atualizar cultura',
    description: 'Atualiza parcialmente uma cultura',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da cultura',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cultura atualizada com sucesso',
    type: CulturaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cultura não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cultura com este nome já existe',
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCulturaDto: UpdateCulturaDto) {
    return this.culturaService.update(id, updateCulturaDto);
  }

  @Delete(':id')
  @Auditable('Cultura')
  @ApiOperation({
    summary: 'Remover cultura',
    description: 'Remove uma cultura do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da cultura',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cultura removida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cultura não encontrada',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.culturaService.remove(id);
  }
}
