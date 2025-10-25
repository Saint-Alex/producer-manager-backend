import { ApiProperty } from '@nestjs/swagger';

export class PropriedadeResponseDto {
  @ApiProperty({
    description: 'ID único da propriedade',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da propriedade rural',
    example: 'Fazenda São João',
  })
  nomeFazenda: string;

  @ApiProperty({
    description: 'Cidade onde está localizada a propriedade',
    example: 'Ribeirão Preto',
  })
  cidade: string;

  @ApiProperty({
    description: 'Estado onde está localizada a propriedade',
    example: 'SP',
  })
  estado: string;

  @ApiProperty({
    description: 'Área total da propriedade em hectares',
    example: 1000.5,
  })
  areaTotal: number;

  @ApiProperty({
    description: 'Área agricultável em hectares',
    example: 600.0,
  })
  areaAgricultavel: number;

  @ApiProperty({
    description: 'Área de vegetação em hectares',
    example: 400.5,
  })
  areaVegetacao: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-10-23T19:36:48.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2023-10-23T19:36:48.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Produtores proprietários desta propriedade',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        nome: { type: 'string' },
        cpfCnpj: { type: 'string' },
      },
    },
  })
  produtores?: Array<{
    id: string;
    nome: string;
    cpfCnpj: string;
  }>;

  @ApiProperty({
    description: 'Cultivos realizados nesta propriedade',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        areaCultivada: { type: 'number' },
        cultura: {
          type: 'object',
          properties: {
            nome: { type: 'string' },
          },
        },
        safra: {
          type: 'object',
          properties: {
            ano: { type: 'number' },
          },
        },
      },
    },
  })
  cultivos?: Array<{
    id: string;
    areaCultivada: number;
    cultura: {
      nome: string;
    };
    safra: {
      ano: number;
    };
  }>;
}
