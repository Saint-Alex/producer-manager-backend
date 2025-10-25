import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCultivoDto } from './update-cultivo.dto';

describe('UpdateCultivoDto', () => {
  describe('partial validation', () => {
    it('should pass with empty object (all fields optional)', async () => {
      const dto = plainToClass(UpdateCultivoDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only areaCultivada provided', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        areaCultivada: 75.5,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only IDs provided', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('inherited validation when fields are provided', () => {
    it('should fail with invalid UUID when provided', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        propriedadeId: 'invalid-uuid',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'propriedadeId');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });

    it('should fail with negative area when provided', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        areaCultivada: -50,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'areaCultivada');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with zero area when provided', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        areaCultivada: 0,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'areaCultivada');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isPositive');
    });
  });

  describe('complete update scenarios', () => {
    it('should validate complete cultivo update', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: 125.75,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle area-only update', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        areaCultivada: 200,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle relationship updates', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        culturaId: '550e8400-e29b-41d4-a716-446655440003',
        safraId: '550e8400-e29b-41d4-a716-446655440004',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle null values', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        areaCultivada: null,
        culturaId: null,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined values', async () => {
      const dto = plainToClass(UpdateCultivoDto, {
        propriedadeId: undefined,
        areaCultivada: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
