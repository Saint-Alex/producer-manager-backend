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
    Query
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { Auditable } from '../../shared/interceptors/audit.interceptor';
import { CultivoService } from './cultivo.service';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { CultivoResponseDto } from './dto/cultivo-response.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';

@ApiTags('Cultivos')
@Controller('cultivos')
export class CultivoController {
  constructor(private readonly cultivoService: CultivoService) {}

  @Post()
  @Auditable('Cultivo')
  @ApiOperation({
    summary: 'Criar novo cultivo',
    description: 'Cria um novo cultivo relacionando propriedade, cultura e safra'
  })
  @ApiBody({
    type: CreateCultivoDto,
    examples: {
      'soja-2025': {
        summary: 'Cultivo Soja 2025',
        description: 'Cultivo de soja na safra 2025',
        value: {
          propriedadeId: 'uuid-da-propriedade',
          culturaId: 'uuid-da-cultura-soja',
          safraId: 'uuid-da-safra-2025',
          areaCultivada: 150.5
        }
      },
      'milho-2025': {
        summary: 'Cultivo Milho 2025',
        description: 'Cultivo de milho na safra 2025',
        value: {
          propriedadeId: 'uuid-da-propriedade',
          culturaId: 'uuid-da-cultura-milho',
          safraId: 'uuid-da-safra-2025',
          areaCultivada: 200.0
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cultivo criado com sucesso',
    type: CultivoResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou área excede limite da propriedade'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cultivo já existe para essa combinação'
  })
  async create(@Body() createCultivoDto: CreateCultivoDto) {
    return this.cultivoService.create(createCultivoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os cultivos',
    description: 'Retorna todos os cultivos com informações completas'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de cultivos retornada com sucesso',
    type: [CultivoResponseDto]
  })
  @ApiQuery({
    name: 'propriedadeId',
    required: false,
    description: 'Filtrar cultivos por ID da propriedade'
  })
  @ApiQuery({
    name: 'safraId',
    required: false,
    description: 'Filtrar cultivos por ID da safra'
  })
  @ApiQuery({
    name: 'culturaId',
    required: false,
    description: 'Filtrar cultivos por ID da cultura'
  })
  async findAll(
    @Query('propriedadeId') propriedadeId?: string,
    @Query('safraId') safraId?: string,
    @Query('culturaId') culturaId?: string
  ) {
    if (propriedadeId) {
      return this.cultivoService.findByPropriedade(propriedadeId);
    }
    if (safraId) {
      return this.cultivoService.findBySafra(safraId);
    }
    if (culturaId) {
      return this.cultivoService.findByCultura(culturaId);
    }
    return this.cultivoService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cultivo por ID',
    description: 'Retorna um cultivo específico com todas as informações relacionadas'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do cultivo',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cultivo encontrado',
    type: CultivoResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cultivo não encontrado'
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cultivoService.findOne(id);
  }

  @Patch(':id')
  @Auditable('Cultivo')
  @ApiOperation({
    summary: 'Atualizar cultivo',
    description: 'Atualiza parcialmente um cultivo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do cultivo',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cultivo atualizado com sucesso',
    type: CultivoResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cultivo não encontrado'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou área excede limite da propriedade'
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCultivoDto: UpdateCultivoDto
  ) {
    return this.cultivoService.update(id, updateCultivoDto);
  }

  @Delete(':id')
  @Auditable('Cultivo')
  @ApiOperation({
    summary: 'Remover cultivo',
    description: 'Remove um cultivo do sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do cultivo',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cultivo removido com sucesso'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cultivo não encontrado'
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.cultivoService.remove(id);
  }
}
