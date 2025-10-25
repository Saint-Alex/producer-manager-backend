import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePropriedadeDto } from './create-propriedade.dto';

describe('CreatePropriedadeDto', () => {
  const validDto = {
    nomeFazenda: 'Fazenda São João',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    areaTotal: 1000.5,
    areaAgricultavel: 600.0,
    areaVegetacao: 400.5,
    produtorIds: ['550e8400-e29b-41d4-a716-446655440000'],
  };

  describe('nomeFazenda validation', () => {
    it('should pass with valid nomeFazenda', async () => {
      const dto = plainToClass(CreatePropriedadeDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty nomeFazenda', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, nomeFazenda: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nomeFazenda');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with non-string nomeFazenda', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, nomeFazenda: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nomeFazenda');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('cidade validation', () => {
    it('should pass with valid cidade', async () => {
      const dto = plainToClass(CreatePropriedadeDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty cidade', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, cidade: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cidade');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with non-string cidade', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, cidade: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cidade');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('estado validation', () => {
    it('should pass with valid estado', async () => {
      const dto = plainToClass(CreatePropriedadeDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty estado', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, estado: '' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('estado');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with non-string estado', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, estado: 123 });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('estado');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('areaTotal validation', () => {
    it('should pass with valid positive areaTotal', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaTotal: 1000.5 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with negative areaTotal', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaTotal: -100 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const areaError = errors.find((error) => error.property === 'areaTotal');
      expect(areaError).toBeDefined();
      expect(areaError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with zero areaTotal', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaTotal: 0 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const areaError = errors.find((error) => error.property === 'areaTotal');
      expect(areaError).toBeDefined();
      expect(areaError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with non-number areaTotal', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaTotal: 'invalid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const areaError = errors.find((error) => error.property === 'areaTotal');
      expect(areaError).toBeDefined();
      expect(areaError.constraints).toHaveProperty('isNumber');
    });
  });

  describe('areaAgricultavel validation', () => {
    it('should pass with valid positive areaAgricultavel', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaAgricultavel: 600.0 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with negative areaAgricultavel', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaAgricultavel: -100 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const areaError = errors.find((error) => error.property === 'areaAgricultavel');
      expect(areaError).toBeDefined();
      expect(areaError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with non-number areaAgricultavel', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaAgricultavel: 'invalid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const areaError = errors.find((error) => error.property === 'areaAgricultavel');
      expect(areaError).toBeDefined();
      expect(areaError.constraints).toHaveProperty('isNumber');
    });
  });

  describe('areaVegetacao validation', () => {
    it('should pass with valid positive areaVegetacao', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaVegetacao: 400.5 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with negative areaVegetacao', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaVegetacao: -100 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const areaError = errors.find((error) => error.property === 'areaVegetacao');
      expect(areaError).toBeDefined();
      expect(areaError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with non-number areaVegetacao', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, areaVegetacao: 'invalid' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const areaError = errors.find((error) => error.property === 'areaVegetacao');
      expect(areaError).toBeDefined();
      expect(areaError.constraints).toHaveProperty('isNumber');
    });
  });

  describe('produtorIds validation', () => {
    it('should pass with valid UUID array', async () => {
      const dto = plainToClass(CreatePropriedadeDto, {
        ...validDto,
        produtorIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty array', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, produtorIds: [] });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('produtorIds');
      expect(errors[0].constraints).toHaveProperty('arrayMinSize');
    });

    it('should fail with non-array', async () => {
      const dto = plainToClass(CreatePropriedadeDto, { ...validDto, produtorIds: 'not-array' });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('produtorIds');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should fail with invalid UUIDs', async () => {
      const dto = plainToClass(CreatePropriedadeDto, {
        ...validDto,
        produtorIds: ['invalid-uuid', '550e8400-e29b-41d4-a716-446655440000'],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('produtorIds');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail with mixed types in array', async () => {
      const dto = plainToClass(CreatePropriedadeDto, {
        ...validDto,
        produtorIds: ['550e8400-e29b-41d4-a716-446655440000', 123],
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('produtorIds');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });

  describe('area sum validation', () => {
    it('should pass when sum of areas equals total', async () => {
      const dto = plainToClass(CreatePropriedadeDto, {
        ...validDto,
        areaTotal: 1000,
        areaAgricultavel: 600,
        areaVegetacao: 400,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass when sum of areas is less than total', async () => {
      const dto = plainToClass(CreatePropriedadeDto, {
        ...validDto,
        areaTotal: 1000,
        areaAgricultavel: 500,
        areaVegetacao: 300,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail when sum of areas exceeds total', async () => {
      const dto = plainToClass(CreatePropriedadeDto, {
        ...validDto,
        areaTotal: 1000,
        areaAgricultavel: 700,
        areaVegetacao: 400, // 700 + 400 = 1100 > 1000
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('_validateAreaSum');
      expect(errors[0].constraints).toHaveProperty(
        'isValidAreaSum',
        'A soma da área agricultável e de vegetação não pode ser maior que a área total',
      );
    });
  });

  describe('multiple validation errors', () => {
    it('should return multiple errors when multiple fields are invalid', async () => {
      const dto = plainToClass(CreatePropriedadeDto, {
        nomeFazenda: '',
        cidade: '',
        estado: '',
        areaTotal: -100,
        areaAgricultavel: -50,
        areaVegetacao: -25,
        produtorIds: [],
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(1);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('nomeFazenda');
      expect(properties).toContain('cidade');
      expect(properties).toContain('estado');
      expect(properties).toContain('areaTotal');
      expect(properties).toContain('areaAgricultavel');
      expect(properties).toContain('areaVegetacao');
      expect(properties).toContain('produtorIds');
    });
  });
});
