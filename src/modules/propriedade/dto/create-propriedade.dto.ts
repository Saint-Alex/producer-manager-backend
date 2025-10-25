import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { IsValidAreaSum } from '../../../shared/validators/area-validation.validator';

export class CreatePropriedadeDto {
  @ApiProperty({
    description: 'Nome da propriedade rural',
    example: 'Fazenda São João',
  })
  @IsString()
  @IsNotEmpty()
  nomeFazenda: string;

  @ApiProperty({
    description: 'Cidade onde está localizada a propriedade',
    example: 'Ribeirão Preto',
  })
  @IsString()
  @IsNotEmpty()
  cidade: string;

  @ApiProperty({
    description: 'Estado onde está localizada a propriedade',
    example: 'SP',
  })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({
    description: 'Área total da propriedade em hectares',
    example: 1000.5,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  areaTotal: number;

  @ApiProperty({
    description: 'Área agricultável em hectares',
    example: 600.0,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  areaAgricultavel: number;

  @ApiProperty({
    description: 'Área de vegetação em hectares',
    example: 400.5,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  areaVegetacao: number;

  @ApiProperty({
    description: 'Array de IDs dos produtores proprietários',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  produtorIds: string[];

  @IsValidAreaSum({
    message: 'A soma da área agricultável e de vegetação não pode ser maior que a área total',
  })
  _validateAreaSum?: any;
}
