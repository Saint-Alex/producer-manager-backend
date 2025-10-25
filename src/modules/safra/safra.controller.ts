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
    Post
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { CreateSafraDto } from './dto/create-safra.dto';
import { SafraResponseDto } from './dto/safra-response.dto';
import { UpdateSafraDto } from './dto/update-safra.dto';
import { SafraService } from './safra.service';

@ApiTags('Safras')
@Controller('safras')
export class SafraController {
  constructor(private readonly safraService: SafraService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova safra',
    description: 'Cria uma nova safra para um ano específico'
  })
  @ApiBody({
    type: CreateSafraDto,
    examples: {
      'safra-atual': {
        summary: 'Safra 2025',
        description: 'Safra atual',
        value: {
          nome: 'Safra 2025',
          ano: 2025,
          dataInicio: '2025-01-01',
          dataFim: '2025-12-31'
        }
      },
      'safra-passada': {
        summary: 'Safra 2024',
        description: 'Safra do ano anterior',
        value: {
          nome: 'Safra 2024',
          ano: 2024,
          dataInicio: '2024-01-01',
          dataFim: '2024-12-31'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Safra criada com sucesso',
    type: SafraResponseDto
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Safra para este ano já existe'
  })
  async create(@Body() createSafraDto: CreateSafraDto) {
    return this.safraService.create(createSafraDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as safras',
    description: 'Retorna todas as safras cadastradas ordenadas por ano (mais recente primeiro)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de safras retornada com sucesso',
    type: [SafraResponseDto]
  })
  async findAll() {
    return this.safraService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar safra por ID',
    description: 'Retorna uma safra específica com informações dos cultivos'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da safra',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safra encontrada',
    type: SafraResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Safra não encontrada'
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.safraService.findOne(id);
  }

  @Get('year/:year')
  @ApiOperation({
    summary: 'Buscar safra por ano',
    description: 'Retorna a safra de um ano específico'
  })
  @ApiParam({
    name: 'year',
    description: 'Ano da safra',
    type: 'number',
    example: 2023
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safra encontrada',
    type: SafraResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Safra não encontrada para este ano'
  })
  async findByYear(@Param('year', ParseIntPipe) year: number) {
    return this.safraService.findByYear(year);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar safra',
    description: 'Atualiza parcialmente uma safra'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da safra',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Safra atualizada com sucesso',
    type: SafraResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Safra não encontrada'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Safra para este ano já existe'
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSafraDto: UpdateSafraDto
  ) {
    return this.safraService.update(id, updateSafraDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover safra',
    description: 'Remove uma safra do sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da safra',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Safra removida com sucesso'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Safra não encontrada'
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.safraService.remove(id);
  }
}
