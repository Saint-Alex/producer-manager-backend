import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCulturaDto {
  @ApiProperty({
    description: 'Nome da cultura',
    example: 'Soja'
  })
  @IsString()
  @IsNotEmpty()
  nome: string;
}
