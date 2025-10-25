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
import { CreateProdutorDto, ProdutorResponseDto, UpdateProdutorDto } from './dto';
import { ProdutorService } from './produtor.service';

@ApiTags('Produtores')
@Controller('produtores')
export class ProdutorController {
  constructor(private readonly produtorService: ProdutorService) {}

  @Post()
  @Auditable('Produtor')
  @ApiOperation({
    summary: 'Criar novo produtor rural',
    description: 'Cadastra um novo produtor rural com CPF/CNPJ validado',
  })
  @ApiBody({
    type: CreateProdutorDto,
    examples: {
      CPF: {
        summary: 'Exemplo com CPF',
        description: 'Produtor pessoa física',
        value: {
          cpfCnpj: '123.456.789-00',
          nome: 'João Silva',
        },
      },
      CNPJ: {
        summary: 'Exemplo com CNPJ',
        description: 'Produtor pessoa jurídica',
        value: {
          cpfCnpj: '12.345.678/0001-90',
          nome: 'Fazenda São José LTDA',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Produtor criado com sucesso',
    type: ProdutorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou CPF/CNPJ já cadastrado',
  })
  async create(@Body() createProdutorDto: CreateProdutorDto) {
    return await this.produtorService.create(createProdutorDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os produtores',
    description: 'Retorna lista de todos os produtores cadastrados com suas propriedades',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de produtores',
    type: [ProdutorResponseDto],
  })
  async findAll() {
    return await this.produtorService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produtor por ID',
    description: 'Retorna um produtor específico com suas propriedades',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do produtor',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produtor encontrado',
    type: ProdutorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produtor não encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.produtorService.findOne(id);
  }

  @Patch(':id')
  @Auditable('Produtor')
  @ApiOperation({
    summary: 'Atualizar produtor',
    description: 'Atualiza dados de um produtor existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do produtor',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateProdutorDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produtor atualizado com sucesso',
    type: ProdutorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produtor não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou CPF/CNPJ já cadastrado',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProdutorDto: UpdateProdutorDto,
  ) {
    return await this.produtorService.update(id, updateProdutorDto);
  }

  @Delete(':id')
  @Auditable('Produtor')
  @ApiOperation({
    summary: 'Excluir produtor',
    description: 'Remove um produtor do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do produtor',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Produtor excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produtor não encontrado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.produtorService.remove(id);
  }
}
