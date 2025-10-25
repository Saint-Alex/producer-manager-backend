import { ApiProperty } from '@nestjs/swagger';

export class CultivoResponseDto {
  @ApiProperty({
    description: 'ID único do cultivo',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Área cultivada em hectares',
    example: 50.5
  })
  areaCultivada: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-10-23T19:36:48.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2023-10-23T19:36:48.000Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Propriedade onde o cultivo é realizado',
    type: 'object',
    properties: {
      id: { type: 'string' },
      nomeFazenda: { type: 'string' },
      cidade: { type: 'string' },
      estado: { type: 'string' },
      areaTotal: { type: 'number' }
    }
  })
  propriedadeRural: {
    id: string;
    nomeFazenda: string;
    cidade: string;
    estado: string;
    areaTotal: number;
  };

  @ApiProperty({
    description: 'Cultura cultivada',
    type: 'object',
    properties: {
      id: { type: 'string' },
      nome: { type: 'string' }
    }
  })
  cultura: {
    id: string;
    nome: string;
  };

  @ApiProperty({
    description: 'Safra correspondente',
    type: 'object',
    properties: {
      id: { type: 'string' },
      ano: { type: 'number' }
    }
  })
  safra: {
    id: string;
    ano: number;
  };
}
