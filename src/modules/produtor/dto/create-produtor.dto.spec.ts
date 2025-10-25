import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProdutorDto } from './create-produtor.dto';

describe('CreateProdutorDto', () => {
  const validDto = {
    nome: 'João Silva Santos',
    cpfCnpj: '11144477735', // Valid CPF
  };

  describe('nome validation', () => {
    it('should pass with valid nome', async () => {
      const dto = plainToClass(CreateProdutorDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty nome', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, nome: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nome');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty', 'Nome é obrigatório');
    });

    it('should fail with nome too short', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, nome: 'A' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nome');
      expect(errors[0].constraints).toHaveProperty('isLength', 'Nome deve ter entre 2 e 255 caracteres');
    });

    it('should fail with nome too long', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, nome: 'A'.repeat(256) });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nome');
      expect(errors[0].constraints).toHaveProperty('isLength', 'Nome deve ter entre 2 e 255 caracteres');
    });

    it('should fail with non-string nome', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, nome: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nome');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('cpfCnpj validation', () => {
    it('should pass with valid CPF', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '11144477735' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with valid CNPJ', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '11222333000181' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with formatted CPF and remove formatting', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '111.444.777-35' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.cpfCnpj).toBe('11144477735'); // Should remove formatting
    });

    it('should pass with formatted CNPJ and remove formatting', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '11.222.333/0001-81' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.cpfCnpj).toBe('11222333000181'); // Should remove formatting
    });

    it('should fail with empty cpfCnpj', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cpfCnpj');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty', 'CPF/CNPJ é obrigatório');
    });

    it('should fail with cpfCnpj too short', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '123456789' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cpfCnpj');
      expect(errors[0].constraints).toHaveProperty('isLength', 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
    });

    it('should fail with cpfCnpj too long', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '123456789012345' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cpfCnpj');
      expect(errors[0].constraints).toHaveProperty('isLength', 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
    });

    it('should fail with invalid CPF', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '11111111111' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cpfCnpj');
      expect(errors[0].constraints).toHaveProperty('isCpfCnpj', 'CPF ou CNPJ inválido');
    });

    it('should fail with invalid CNPJ', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: '11111111111111' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cpfCnpj');
      expect(errors[0].constraints).toHaveProperty('isCpfCnpj', 'CPF ou CNPJ inválido');
    });

    it('should fail with non-string cpfCnpj', async () => {
      const dto = plainToClass(CreateProdutorDto, { ...validDto, cpfCnpj: 11144477735 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cpfCnpj');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('multiple validation errors', () => {
    it('should return multiple errors when both fields are invalid', async () => {
      const dto = plainToClass(CreateProdutorDto, { nome: '', cpfCnpj: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(2);

      const nomeError = errors.find(error => error.property === 'nome');
      const cpfCnpjError = errors.find(error => error.property === 'cpfCnpj');

      expect(nomeError?.constraints).toHaveProperty('isNotEmpty', 'Nome é obrigatório');
      expect(cpfCnpjError?.constraints).toHaveProperty('isNotEmpty', 'CPF/CNPJ é obrigatório');
    });
  });

  describe('transform functionality', () => {
    it('should remove non-digit characters from cpfCnpj', async () => {
      const dto = plainToClass(CreateProdutorDto, {
        ...validDto,
        cpfCnpj: '111abc444def777ghi35'
      });

      expect(dto.cpfCnpj).toBe('11144477735');
    });

    it('should handle non-string values in transform', async () => {
      const dto = plainToClass(CreateProdutorDto, {
        ...validDto,
        cpfCnpj: null
      });

      expect(dto.cpfCnpj).toBeNull();
    });
  });
});
