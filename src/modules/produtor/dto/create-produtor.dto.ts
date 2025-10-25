import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsCpfCnpj } from '../../../shared/validators/cpf-cnpj.validator';

export class CreateProdutorDto {
  @ApiProperty({
    description: 'CPF (11 dígitos) ou CNPJ (14 dígitos) do produtor',
    example: '12345678901',
    minLength: 11,
    maxLength: 14,
  })
  @IsNotEmpty({ message: 'CPF/CNPJ é obrigatório' })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/\D/g, '') : value)
  @Length(11, 14, { message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos' })
  @IsCpfCnpj({ message: 'CPF ou CNPJ inválido' })
  cpfCnpj: string;

  @ApiProperty({
    description: 'Nome completo do produtor rural',
    example: 'João Silva Santos',
    minLength: 2,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  @Length(2, 255, { message: 'Nome deve ter entre 2 e 255 caracteres' })
  nome: string;
}
