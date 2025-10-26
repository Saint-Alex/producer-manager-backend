import { ApiProperty } from '@nestjs/swagger';

export class SafraResponseDto {
  @ApiProperty({
    description: 'ID único da safra',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da safra',
    example: 'Safra Soja 2024/25',
  })
  nome: string;

  @ApiProperty({
    description: 'Ano da safra',
    example: 2024,
  })
  ano: number;

  @ApiProperty({
    description: 'Data de início da safra',
    example: '2024-09-01T00:00:00.000Z',
    required: false,
  })
  dataInicio?: Date;

  @ApiProperty({
    description: 'Data de fim da safra',
    example: '2025-03-31T00:00:00.000Z',
    required: false,
  })
  dataFim?: Date;

  @ApiProperty({
    description: 'Propriedade rural onde a safra é cultivada',
    type: 'object',
    properties: {
      id: { type: 'string' },
      nomeFazenda: { type: 'string' },
      cidade: { type: 'string' },
      estado: { type: 'string' },
      areaTotal: { type: 'number' },
    },
  })
  propriedadeRural: {
    id: string;
    nomeFazenda: string;
    cidade: string;
    estado: string;
    areaTotal: number;
  };

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-10-23T19:36:48.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2024-10-23T19:36:48.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Cultivos desta safra',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        areaPlantada: { type: 'number' },
        cultura: {
          type: 'object',
          properties: {
            nome: { type: 'string' },
          },
        },
      },
    },
  })
  cultivos?: Array<{
    id: string;
    areaPlantada: number;
    cultura: {
      nome: string;
    };
  }>;
}
