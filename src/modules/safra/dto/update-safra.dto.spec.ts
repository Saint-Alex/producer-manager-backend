import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSafraDto } from './update-safra.dto';

describe('UpdateSafraDto', () => {
  describe('partial validation', () => {
    it('should pass with empty object (all fields optional)', async () => {
      const dto = plainToClass(UpdateSafraDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only nome provided', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: 'Safra Atualizada 2024',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only ano provided', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        ano: 2025,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('inherited validation when fields are provided', () => {
    it('should fail with invalid nome when provided', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('minLength');
    });

    it('should fail with nome too long when provided', async () => {
      const longNome = 'a'.repeat(101);
      const dto = plainToClass(UpdateSafraDto, {
        nome: longNome,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('maxLength');
    });

    it('should fail with ano below minimum when provided', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        ano: 1999,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'ano');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('min');
    });

    it('should fail with ano above maximum when provided', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        ano: 2051,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'ano');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('max');
    });

    it('should fail with non-number ano when provided', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        ano: 'invalid',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'ano');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNumber');
    });
  });

  describe('complete update scenarios', () => {
    it('should validate complete safra update', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: 'Safra Completamente Atualizada 2024',
        ano: 2024,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle nome-only update', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: 'Nova Safra de Inverno',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle ano-only update', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        ano: 2030,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle boundary values', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: 'S', // minimum length
        ano: 2000, // minimum year
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle max values', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: 'a'.repeat(100), // maximum length
        ano: 2050, // maximum year
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple validation errors', () => {
    it('should return errors for multiple invalid fields', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: '',
        ano: 1999,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(2);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('nome');
      expect(properties).toContain('ano');
    });
  });

  describe('edge cases', () => {
    it('should handle null values', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: null,
        ano: null,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined values', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: undefined,
        ano: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in nome', async () => {
      const dto = plainToClass(UpdateSafraDto, {
        nome: 'Safra 2024/2025 - Verão',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
