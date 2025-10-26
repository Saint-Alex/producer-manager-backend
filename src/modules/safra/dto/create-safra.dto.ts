import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSafraDto {
  @ApiProperty({
    description: 'Nome da safra',
    example: 'Safra Soja 2024/25',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nome: string;

  @ApiProperty({
    description: 'Ano da safra',
    example: 2024,
    minimum: 2000,
    maximum: 2050,
  })
  @IsNumber()
  @Min(2000)
  @Max(2050)
  ano: number;

  @ApiProperty({
    description: 'ID da propriedade rural onde a safra será cultivada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'ID da propriedade é obrigatório' })
  @IsUUID('4', { message: 'ID da propriedade deve ser um UUID válido' })
  propriedadeRuralId: string;
}
