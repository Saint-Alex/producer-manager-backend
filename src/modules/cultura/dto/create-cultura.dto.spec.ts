import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCulturaDto } from './create-cultura.dto';

describe('CreateCulturaDto', () => {
  const validDto = {
    nome: 'Soja'
  };

  describe('nome validation', () => {
    it('should pass with valid nome', async () => {
      const dto = plainToClass(CreateCulturaDto, validDto);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should pass with whitespace nome (IsNotEmpty allows whitespace)', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: '   ' });
      const errors = await validate(dto);

      // IsNotEmpty by default allows whitespace, only checks for null/undefined/empty string
      expect(errors).toHaveLength(0);
    });

    it('should fail with non-string nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: 123 });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should fail with null nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: null });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should fail with undefined nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: undefined });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isNotEmpty');
    });

    it('should pass with single character nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: 'A' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with long nome', async () => {
      const longNome = 'Cultura com nome muito longo para testar se aceita nomes extensos';
      const dto = plainToClass(CreateCulturaDto, { nome: longNome });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with special characters in nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: 'Milho-Verde (Híbrido)' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with unicode characters in nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: 'Açaí' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass with numbers in nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: 'Soja BRS 123' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('common culture names', () => {
    const commonCultures = [
      'Soja',
      'Milho',
      'Algodão',
      'Café',
      'Cana-de-açúcar',
      'Arroz',
      'Feijão',
      'Trigo',
      'Mandioca',
      'Batata'
    ];

    commonCultures.forEach(cultura => {
      it(`should pass validation for culture: ${cultura}`, async () => {
        const dto = plainToClass(CreateCulturaDto, { nome: cultura });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('edge cases', () => {
    it('should fail with boolean nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: true });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should fail with array nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: ['Soja'] });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });

    it('should fail with object nome', async () => {
      const dto = plainToClass(CreateCulturaDto, { nome: { value: 'Soja' } });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
      const propertyError = errors.find(error => error.property === 'nome');
      expect(propertyError).toBeDefined();
      expect(propertyError.constraints).toHaveProperty('isString');
    });
  });

  describe('valid complete object', () => {
    it('should pass validation with valid cultura name', async () => {
      const dto = plainToClass(CreateCulturaDto, {
        nome: 'Milho Safrinha'
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimal valid data', async () => {
      const dto = plainToClass(CreateCulturaDto, {
        nome: 'X'
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
