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
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auditable } from '../../shared/interceptors/audit.interceptor';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { PropriedadeResponseDto } from './dto/propriedade-response.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';
import { PropriedadeService } from './propriedade.service';

@ApiTags('Propriedades')
@Controller('propriedades')
export class PropriedadeController {
  constructor(private readonly propriedadeService: PropriedadeService) {}

  @Post()
  @Auditable('Propriedade')
  @ApiOperation({
    summary: 'Criar nova propriedade rural',
    description: 'Cria uma nova propriedade rural com validação de áreas e produtores',
  })
  @ApiBody({
    type: CreatePropriedadeDto,
    examples: {
      'fazenda-pequena': {
        summary: 'Fazenda Pequena',
        description: 'Exemplo de uma pequena propriedade rural',
        value: {
          nomeFazenda: 'Fazenda Boa Vista',
          cidade: 'Ribeirão Preto',
          estado: 'SP',
          areaTotal: 100.5,
          areaAgricultavel: 80.0,
          areaVegetacao: 20.5,
          produtorIds: ['uuid-do-produtor-1'],
        },
      },
      'fazenda-grande': {
        summary: 'Fazenda Grande',
        description: 'Exemplo de uma grande propriedade rural',
        value: {
          nomeFazenda: 'Fazenda Santa Helena',
          cidade: 'Sorriso',
          estado: 'MT',
          areaTotal: 5000.0,
          areaAgricultavel: 4000.0,
          areaVegetacao: 1000.0,
          produtorIds: ['uuid-do-produtor-1', 'uuid-do-produtor-2'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Propriedade criada com sucesso',
    type: PropriedadeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou validação de área falhou',
  })
  async create(@Body() createPropriedadeDto: CreatePropriedadeDto) {
    return this.propriedadeService.create(createPropriedadeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as propriedades',
    description: 'Retorna todas as propriedades rurais com informações de produtores e cultivos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de propriedades retornada com sucesso',
    type: [PropriedadeResponseDto],
  })
  @ApiQuery({
    name: 'produtorId',
    required: false,
    description: 'Filtrar propriedades por ID do produtor',
  })
  async findAll(@Query('produtorId') produtorId?: string) {
    if (produtorId) {
      return this.propriedadeService.findByProdutor(produtorId);
    }
    return this.propriedadeService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar propriedade por ID',
    description: 'Retorna uma propriedade específica com todas as informações relacionadas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da propriedade',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Propriedade encontrada',
    type: PropriedadeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Propriedade não encontrada',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propriedadeService.findOne(id);
  }

  @Patch(':id')
  @Auditable('Propriedade')
  @ApiOperation({
    summary: 'Atualizar propriedade',
    description: 'Atualiza parcialmente uma propriedade rural',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da propriedade',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Propriedade atualizada com sucesso',
    type: PropriedadeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Propriedade não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou validação de área falhou',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropriedadeDto: UpdatePropriedadeDto,
  ) {
    return this.propriedadeService.update(id, updatePropriedadeDto);
  }

  @Delete(':id')
  @Auditable('Propriedade')
  @ApiOperation({
    summary: 'Remover propriedade',
    description: 'Remove uma propriedade rural do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da propriedade',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Propriedade removida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Propriedade não encontrada',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.propriedadeService.remove(id);
  }
}
