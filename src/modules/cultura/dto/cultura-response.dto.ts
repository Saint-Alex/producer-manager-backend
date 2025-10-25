import { ApiProperty } from '@nestjs/swagger';

export class CulturaResponseDto {
  @ApiProperty({
    description: 'ID único da cultura',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da cultura',
    example: 'Soja',
  })
  nome: string;

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
    description: 'Cultivos desta cultura',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        areaCultivada: { type: 'number' },
        propriedade: {
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
    areaCultivada: number;
    propriedade: {
      nome: string;
    };
  }>;
}
