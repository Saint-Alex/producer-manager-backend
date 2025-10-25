import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateSafraDto {
  @ApiProperty({
    description: 'Nome da safra',
    example: 'Safra 2023',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nome: string;

  @ApiProperty({
    description: 'Ano da safra',
    example: 2023,
    minimum: 2000,
    maximum: 2050,
  })
  @IsNumber()
  @Min(2000)
  @Max(2050)
  ano: number;
}
