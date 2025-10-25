import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProdutorDto } from './update-produtor.dto';

describe('UpdateProdutorDto', () => {
  describe('partial validation', () => {
    it('should pass with empty object (all fields optional)', async () => {
      const dto = plainToClass(UpdateProdutorDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only nome provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: 'João Silva',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only cpfCnpj provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        cpfCnpj: '11144477735', // Valid CPF
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with both fields provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: 'Maria Santos',
        cpfCnpj: '11144477735', // Valid CPF
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('inherited validation when fields are provided', () => {
    it('should fail with invalid nome when provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isLength');
    });

    it('should fail with invalid cpfCnpj when provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        cpfCnpj: '123',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'cpfCnpj');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isLength');
    });

    it('should apply transform to cpfCnpj when provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        cpfCnpj: '111.444.777-35',
      });

      // Transform should remove formatting
      expect(dto.cpfCnpj).toBe('11144477735');

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate CPF format when provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        cpfCnpj: '11144477735', // Valid CPF
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate CNPJ format when provided', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        cpfCnpj: '11222333000181', // Valid CNPJ
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple field updates', () => {
    it('should validate multiple fields correctly', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: 'José Carlos Silva',
        cpfCnpj: '11144477735', // Valid CPF
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for multiple invalid fields', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: '',
        cpfCnpj: '123',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(2);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('nome');
      expect(properties).toContain('cpfCnpj');
    });
  });

  describe('edge cases', () => {
    it('should handle null values (treated as undefined)', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: null,
        cpfCnpj: null,
      });
      const errors = await validate(dto);
      // Null values are typically ignored in partial updates
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined values', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: undefined,
        cpfCnpj: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('real-world update scenarios', () => {
    it('should handle name-only update', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: 'Nome Atualizado',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle cpfCnpj-only update', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        cpfCnpj: '11144477735', // Valid CPF
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle complete profile update', async () => {
      const dto = plainToClass(UpdateProdutorDto, {
        nome: 'Produtor Rural Atualizado',
        cpfCnpj: '11222333000181', // Valid CNPJ
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
