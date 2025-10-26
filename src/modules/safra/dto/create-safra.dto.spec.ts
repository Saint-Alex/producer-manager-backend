import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSafraDto } from './create-safra.dto';

describe('CreateSafraDto', () => {
  const validDto = {
    nome: 'Safra 2023',
    ano: 2023,
    propriedadeRuralId: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('nome validation', () => {
    it('should pass with valid nome', async () => {
      const dto = plainToClass(CreateSafraDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty nome', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, nome: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('minLength');
    });

    it('should fail with nome too long', async () => {
      const longNome = 'a'.repeat(101);
      const dto = plainToClass(CreateSafraDto, { ...validDto, nome: longNome });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('maxLength');
    });

    it('should fail with non-string nome', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, nome: 123 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should pass with nome at minimum length', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, nome: 'a' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with nome at maximum length', async () => {
      const maxNome = 'a'.repeat(100);
      const dto = plainToClass(CreateSafraDto, { ...validDto, nome: maxNome });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('ano validation', () => {
    it('should pass with valid ano', async () => {
      const dto = plainToClass(CreateSafraDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with ano below minimum', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, ano: 1999 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'ano');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('min');
    });

    it('should fail with ano above maximum', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, ano: 2051 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'ano');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('max');
    });

    it('should fail with non-number ano', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, ano: 'invalid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'ano');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNumber');
    });

    it('should pass with ano at minimum value', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, ano: 2000 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with ano at maximum value', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, ano: 2050 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with decimal year converted to integer', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, ano: 2023.7 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple validation errors', () => {
    it('should return multiple errors when both fields are invalid', async () => {
      const dto = plainToClass(CreateSafraDto, {
        nome: '',
        ano: 1999,
        propriedadeRuralId: 'invalid-uuid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(3);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('nome');
      expect(properties).toContain('ano');
      expect(properties).toContain('propriedadeRuralId');
    });

    it('should return multiple errors for multiple invalid constraints', async () => {
      const dto = plainToClass(CreateSafraDto, {
        nome: 'a'.repeat(101), // too long
        ano: 'not-a-number', // not a number
        propriedadeRuralId: '', // empty
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(3);

      const nomeError = errors.find((error) => error.property === 'nome');
      expect(nomeError).toBeDefined();
      expect(nomeError.constraints).toHaveProperty('maxLength');

      const anoError = errors.find((error) => error.property === 'ano');
      expect(anoError).toBeDefined();
      expect(anoError.constraints).toHaveProperty('isNumber');

      const propError = errors.find((error) => error.property === 'propriedadeRuralId');
      expect(propError).toBeDefined();
      expect(propError.constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('valid complete object', () => {
    it('should pass validation with all valid fields', async () => {
      const dto = plainToClass(CreateSafraDto, {
        nome: 'Safra Verão 2024',
        ano: 2024,
        propriedadeRuralId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with different valid values', async () => {
      const dto = plainToClass(CreateSafraDto, {
        nome: 'S',
        ano: 2025,
        propriedadeRuralId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in nome', async () => {
      const dto = plainToClass(CreateSafraDto, {
        ...validDto,
        nome: 'Safra 2023/2024 - Inverno',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle unicode characters in nome', async () => {
      const dto = plainToClass(CreateSafraDto, {
        ...validDto,
        nome: 'Safra Verão 2023 ção',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('propriedadeRuralId validation', () => {
    it('should pass with valid propriedadeRuralId', async () => {
      const dto = plainToClass(CreateSafraDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty propriedadeRuralId', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, propriedadeRuralId: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeRuralId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with invalid UUID format', async () => {
      const dto = plainToClass(CreateSafraDto, { ...validDto, propriedadeRuralId: 'invalid-uuid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeRuralId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });

    it('should fail with missing propriedadeRuralId', async () => {
      const { propriedadeRuralId: _propriedadeRuralId, ...dtoWithoutPropId } = validDto;
      const dto = plainToClass(CreateSafraDto, dtoWithoutPropId);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeRuralId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should pass with different valid UUID formats', async () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b811-9dad-41d1-80b4-00c04fd430c8',
      ];

      for (const uuid of validUUIDs) {
        const dto = plainToClass(CreateSafraDto, { ...validDto, propriedadeRuralId: uuid });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail with non-v4 UUID', async () => {
      const dto = plainToClass(CreateSafraDto, {
        ...validDto,
        propriedadeRuralId: '550e8400-e29b-41d4-a716-44665544000', // Missing one character
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeRuralId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });
  });
});
