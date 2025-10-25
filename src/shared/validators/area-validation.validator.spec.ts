import { IsValidAreaSumConstraint } from './area-validation.validator';

describe('IsValidAreaSumConstraint', () => {
  let validator: IsValidAreaSumConstraint;

  beforeEach(() => {
    validator = new IsValidAreaSumConstraint();
  });

  describe('area validation', () => {
    it('should validate when sum of areas equals total', () => {
      const validObject = {
        areaTotal: 100,
        areaAgricultavel: 60,
        areaVegetacao: 40,
      };

      const result = validator.validate(validObject.areaTotal, {
        object: validObject,
      } as any);

      expect(result).toBe(true);
    });

    it('should validate when sum of areas is less than total', () => {
      const validObject = {
        areaTotal: 100,
        areaAgricultavel: 50,
        areaVegetacao: 30,
      };

      const result = validator.validate(validObject.areaTotal, {
        object: validObject,
      } as any);

      expect(result).toBe(true);
    });

    it('should reject when sum of areas exceeds total', () => {
      const invalidObject = {
        areaTotal: 100,
        areaAgricultavel: 70,
        areaVegetacao: 50, // 70 + 50 = 120 > 100
      };

      const result = validator.validate(invalidObject.areaTotal, {
        object: invalidObject,
      } as any);

      expect(result).toBe(false);
    });

    it('should validate when only one area is provided', () => {
      const validObject = {
        areaTotal: 100,
        areaAgricultavel: 100,
        areaVegetacao: 0,
      };

      const result = validator.validate(validObject.areaTotal, {
        object: validObject,
      } as any);

      expect(result).toBe(true);
    });

    it('should validate when areas are zero', () => {
      const validObject = {
        areaTotal: 100,
        areaAgricultavel: 0,
        areaVegetacao: 0,
      };

      const result = validator.validate(validObject.areaTotal, {
        object: validObject,
      } as any);

      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return true when areaTotal is missing', () => {
      const object = {
        areaAgricultavel: 60,
        areaVegetacao: 40,
      };

      const result = validator.validate(undefined, {
        object: object,
      } as any);

      expect(result).toBe(true);
    });

    it('should return true when areaAgricultavel is missing', () => {
      const object = {
        areaTotal: 100,
        areaVegetacao: 40,
      };

      const result = validator.validate(100, {
        object: object,
      } as any);

      expect(result).toBe(true);
    });

    it('should return true when areaVegetacao is missing', () => {
      const object = {
        areaTotal: 100,
        areaAgricultavel: 60,
      };

      const result = validator.validate(100, {
        object: object,
      } as any);

      expect(result).toBe(true);
    });

    it('should return true when all areas are missing', () => {
      const object = {};

      const result = validator.validate(undefined, {
        object: object,
      } as any);

      expect(result).toBe(true);
    });

    it('should handle string numbers correctly', () => {
      const validObject = {
        areaTotal: '100',
        areaAgricultavel: '60',
        areaVegetacao: '40',
      };

      const result = validator.validate(validObject.areaTotal, {
        object: validObject,
      } as any);

      expect(result).toBe(true);
    });

    it('should handle decimal numbers correctly', () => {
      const validObject = {
        areaTotal: 100.5,
        areaAgricultavel: 60.25,
        areaVegetacao: 40.25,
      };

      const result = validator.validate(validObject.areaTotal, {
        object: validObject,
      } as any);

      expect(result).toBe(true);
    });

    it('should reject when decimal sum exceeds total', () => {
      const invalidObject = {
        areaTotal: 100.0,
        areaAgricultavel: 60.5,
        areaVegetacao: 40.5, // 60.5 + 40.5 = 101 > 100
      };

      const result = validator.validate(invalidObject.areaTotal, {
        object: invalidObject,
      } as any);

      expect(result).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message', () => {
      const message = validator.defaultMessage({} as any);
      expect(message).toBe(
        'A soma da área agricultável e área de vegetação não pode ser maior que a área total',
      );
    });
  });
});
