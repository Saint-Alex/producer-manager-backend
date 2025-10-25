import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsUUID
} from 'class-validator';

export class CreateCultivoDto {
  @ApiProperty({
    description: 'ID da propriedade onde será realizado o cultivo',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID(4)
  @IsNotEmpty()
  propriedadeId: string;

  @ApiProperty({
    description: 'ID da cultura a ser cultivada',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID(4)
  @IsNotEmpty()
  culturaId: string;

  @ApiProperty({
    description: 'ID da safra correspondente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID(4)
  @IsNotEmpty()
  safraId: string;

  @ApiProperty({
    description: 'Área cultivada em hectares',
    example: 50.5,
    minimum: 0.01
  })
  @IsNumber()
  @IsPositive()
  areaCultivada: number;
}
