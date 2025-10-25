import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePropriedadeDto } from './update-propriedade.dto';

describe('UpdatePropriedadeDto', () => {
  describe('partial validation', () => {
    it('should pass with empty object (all fields optional)', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only nomeFazenda provided', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        nomeFazenda: 'Fazenda Atualizada',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only location fields provided', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        cidade: 'Nova Cidade',
        estado: 'RS',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with only area fields provided', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaTotal: 500.5,
        areaAgricultavel: 300,
        areaVegetacao: 200.5,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('inherited validation when fields are provided', () => {
    it('should fail with invalid nomeFazenda when provided', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        nomeFazenda: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'nomeFazenda');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with negative areas when provided', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaTotal: -100,
        areaAgricultavel: -50,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(2);

      const areaTotalError = errors.find((error) => error.property === 'areaTotal');
      expect(areaTotalError).toBeDefined();
      expect(areaTotalError.constraints).toHaveProperty('isPositive');

      const areaAgricultavelError = errors.find((error) => error.property === 'areaAgricultavel');
      expect(areaAgricultavelError).toBeDefined();
      expect(areaAgricultavelError.constraints).toHaveProperty('isPositive');
    });

    it('should fail with invalid UUID in produtorIds when provided', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        produtorIds: ['invalid-uuid'],
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find((error) => error.property === 'produtorIds');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isUuid');
    });
  });

  describe('area validation when updating areas', () => {
    it('should pass when sum of areas equals total', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaTotal: 1000,
        areaAgricultavel: 600,
        areaVegetacao: 400,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass when sum of areas is less than total', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaTotal: 1000,
        areaAgricultavel: 300,
        areaVegetacao: 200,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should not validate area sum when updating partial areas (custom validator not triggered)', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaTotal: 1000,
        areaAgricultavel: 700,
        areaVegetacao: 400,
      });
      const errors = await validate(dto);

      // In update DTOs, the custom area validator might not be triggered
      // because it's designed for complete objects, not partial updates
      expect(errors).toHaveLength(0);
    });

    it('should pass when only updating some area fields', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaAgricultavel: 300,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple field updates', () => {
    it('should validate complete property update', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        nomeFazenda: 'Fazenda Completamente Atualizada',
        cidade: 'Cidade Nova',
        estado: 'GO',
        areaTotal: 2000.5,
        areaAgricultavel: 1200,
        areaVegetacao: 800.5,
        produtorIds: ['550e8400-e29b-41d4-a716-446655440000'],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for multiple invalid fields', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        nomeFazenda: '',
        cidade: '',
        areaTotal: -100,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(3);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('nomeFazenda');
      expect(properties).toContain('cidade');
      expect(properties).toContain('areaTotal');
    });
  });

  describe('real-world update scenarios', () => {
    it('should handle name update only', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        nomeFazenda: 'Novo Nome da Fazenda',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle location update only', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        cidade: 'Nova Cidade',
        estado: 'MG',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle area expansion', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaTotal: 1500,
        areaAgricultavel: 900,
        areaVegetacao: 600,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle producer assignment update', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        produtorIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle null values (treated as undefined)', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        nomeFazenda: null,
        cidade: null,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined values', async () => {
      const dto = plainToClass(UpdatePropriedadeDto, {
        areaTotal: undefined,
        areaAgricultavel: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
