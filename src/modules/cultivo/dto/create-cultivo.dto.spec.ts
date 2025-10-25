import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCultivoDto } from './create-cultivo.dto';

describe('CreateCultivoDto', () => {
  const validDto = {
    propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
    culturaId: '550e8400-e29b-41d4-a716-446655440001',
    safraId: '550e8400-e29b-41d4-a716-446655440002',
    areaCultivada: 50.5,
  };

  describe('propriedadeId validation', () => {
    it('should pass with valid UUID', async () => {
      const dto = plainToClass(CreateCultivoDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty propriedadeId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, propriedadeId: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with invalid UUID format for propriedadeId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, propriedadeId: 'invalid-uuid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });

    it('should fail with non-string propriedadeId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, propriedadeId: 123 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });
  });

  describe('culturaId validation', () => {
    it('should pass with valid UUID', async () => {
      const dto = plainToClass(CreateCultivoDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty culturaId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, culturaId: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'culturaId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with invalid UUID format for culturaId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, culturaId: 'invalid-uuid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'culturaId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });

    it('should fail with non-string culturaId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, culturaId: 123 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'culturaId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });
  });

  describe('safraId validation', () => {
    it('should pass with valid UUID', async () => {
      const dto = plainToClass(CreateCultivoDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty safraId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, safraId: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'safraId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with invalid UUID format for safraId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, safraId: 'invalid-uuid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'safraId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });

    it('should fail with non-string safraId', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, safraId: 123 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'safraId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });
  });

  describe('areaCultivada validation', () => {
    it('should pass with valid positive area', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, areaCultivada: 100.75 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with negative areaCultivada', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, areaCultivada: -50 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'areaCultivada');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with zero areaCultivada', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, areaCultivada: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'areaCultivada');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with non-number areaCultivada', async () => {
      const dto = plainToClass(CreateCultivoDto, { ...validDto, areaCultivada: 'invalid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'areaCultivada');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNumber');
    });
  });

  describe('multiple validation errors', () => {
    it('should return multiple errors when multiple fields are invalid', async () => {
      const dto = plainToClass(CreateCultivoDto, {
        propriedadeId: 'invalid-uuid',
        culturaId: '',
        safraId: 123,
        areaCultivada: -50,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(4);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('propriedadeId');
      expect(properties).toContain('culturaId');
      expect(properties).toContain('safraId');
      expect(properties).toContain('areaCultivada');
    });
  });

  describe('valid complete object', () => {
    it('should pass validation with all valid fields', async () => {
      const dto = plainToClass(CreateCultivoDto, {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: 75.25,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
