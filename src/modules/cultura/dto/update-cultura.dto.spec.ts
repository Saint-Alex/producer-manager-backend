import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCulturaDto } from './update-cultura.dto';

describe('UpdateCulturaDto', () => {
  describe('partial validation', () => {
    it('should pass with empty object (all fields optional)', async () => {
      const dto = plainToClass(UpdateCulturaDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with valid nome provided', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'Milho Atualizado'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('inherited validation when nome is provided', () => {
    it('should fail with empty nome when provided', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: ''
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with non-string nome when provided', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 123
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should handle null nome (treated as undefined in partial update)', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: null
      });
      const errors = await validate(dto);

      // In partial updates, null is typically treated as undefined and ignored
      expect(errors).toHaveLength(0);
    });

    it('should pass with whitespace nome (IsNotEmpty allows whitespace)', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: '   '
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('valid update scenarios', () => {
    const validCultureUpdates = [
      'Soja Transgênica',
      'Milho Híbrido',
      'Algodão BT',
      'Café Arábica',
      'Cana-de-açúcar',
      'Arroz Irrigado',
      'Feijão Carioca',
      'Trigo de Inverno'
    ];

    validCultureUpdates.forEach(cultura => {
      it(`should pass validation for culture update: ${cultura}`, async () => {
        const dto = plainToClass(UpdateCulturaDto, { nome: cultura });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });

    it('should handle single character nome', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'A'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle long nome', async () => {
      const longNome = 'Cultura com nome muito longo para atualização completa';
      const dto = plainToClass(UpdateCulturaDto, {
        nome: longNome
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in nome', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'Milho-Verde (Híbrido) - Atualizado'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle unicode characters in nome', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'Açaí Atualizado'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle numbers in nome', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'Soja BRS 9999 - Nova Variedade'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should fail with boolean nome when provided', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: true
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should fail with array nome when provided', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: ['Soja']
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should fail with object nome when provided', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: { value: 'Soja' }
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should handle undefined nome (no validation triggered)', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: undefined
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('real-world update scenarios', () => {
    it('should handle culture name modernization', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'Soja RR Intacta'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle variety specification', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'Milho Safra da Seca'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle minimal valid update', async () => {
      const dto = plainToClass(UpdateCulturaDto, {
        nome: 'X'
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
