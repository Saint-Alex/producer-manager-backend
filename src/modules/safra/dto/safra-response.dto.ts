import { ApiProperty } from '@nestjs/swagger';

export class SafraResponseDto {
  @ApiProperty({
    description: 'ID único da safra',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Ano da safra',
    example: 2023
  })
  ano: number;

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
    description: 'Cultivos desta safra',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        areaCultivada: { type: 'number' },
        cultura: {
          type: 'object',
          properties: {
            nome: { type: 'string' }
          }
        },
        propriedade: {
          type: 'object',
          properties: {
            nome: { type: 'string' }
          }
        }
      }
    }
  })
  cultivos?: Array<{
    id: string;
    areaCultivada: number;
    cultura: {
      nome: string;
    };
    propriedade: {
      nome: string;
    };
  }>;
}
