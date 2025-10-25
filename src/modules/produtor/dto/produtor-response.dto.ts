import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PropriedadeResponseDto {
  @ApiProperty({ description: 'ID da propriedade' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Nome da fazenda' })
  @Expose()
  nomeFazenda: string;

  @ApiProperty({ description: 'Cidade da propriedade' })
  @Expose()
  cidade: string;

  @ApiProperty({ description: 'Estado da propriedade' })
  @Expose()
  estado: string;

  @ApiProperty({ description: 'Área total em hectares' })
  @Expose()
  areaTotal: number;
}

export class ProdutorResponseDto {
  @ApiProperty({
    description: 'ID único do produtor',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do produtor',
    example: '12345678901'
  })
  @Expose()
  cpfCnpj: string;

  @ApiProperty({
    description: 'Nome do produtor',
    example: 'João Silva Santos'
  })
  @Expose()
  nome: string;

  @ApiProperty({
    description: 'Lista de propriedades rurais do produtor',
    type: [PropriedadeResponseDto],
    required: false
  })
  @Expose()
  @Type(() => PropriedadeResponseDto)
  propriedades?: PropriedadeResponseDto[];

  @ApiProperty({ description: 'Data de criação' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  @Expose()
  updatedAt: Date;
}
