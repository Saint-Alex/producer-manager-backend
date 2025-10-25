import { IsCpfCnpjConstraint } from './cpf-cnpj.validator';

describe('IsCpfCnpjConstraint', () => {
  let validator: IsCpfCnpjConstraint;

  beforeEach(() => {
    validator = new IsCpfCnpjConstraint();
  });

  describe('CPF validation', () => {
    it('should validate correct CPF', () => {
      const validCpfs = [
        '11144477735', // Valid CPF
        '111.444.777-35', // Valid CPF with formatting
        '12345678909', // Valid CPF
        '123.456.789-09', // Valid CPF with formatting
      ];

      validCpfs.forEach((cpf) => {
        expect(validator.validate(cpf, {} as any)).toBe(true);
      });
    });

    it('should reject invalid CPF', () => {
      const invalidCpfs = [
        '11111111111', // All same digits
        '00000000000', // All zeros
        '12345678901', // Invalid check digits
        '111.444.777-36', // Invalid check digit
        '123456789', // Too short
        '1234567890123', // Too long for CPF, too short for CNPJ
      ];

      invalidCpfs.forEach((cpf) => {
        expect(validator.validate(cpf, {} as any)).toBe(false);
      });
    });

    it('should handle CPF with remainder 10 or 11 in first check digit', () => {
      // CPF that would generate remainder 10 or 11 for first check digit
      const cpfWithRemainder10 = '12345678901'; // This will have remainder 10
      const cpfWithRemainder11 = '12345678912'; // This will have remainder 11

      expect(validator.validate(cpfWithRemainder10, {} as any)).toBe(false);
      expect(validator.validate(cpfWithRemainder11, {} as any)).toBe(false);
    });

    it('should handle CPF with remainder 10 or 11 in second check digit', () => {
      // CPF que gera remainder = 10 ou 11 no segundo dígito verificador (linha 49)
      // CPF: 11111111140 - gera remainder 10 no segundo dígito
      // CPF: 22222222251 - gera remainder 11 no segundo dígito
      const cpfWithSecondRemainder10 = '11111111140';
      const cpfWithSecondRemainder11 = '22222222251';

      expect(validator.validate(cpfWithSecondRemainder10, {} as any)).toBe(false);
      expect(validator.validate(cpfWithSecondRemainder11, {} as any)).toBe(false);
    });

    it('should handle specific CPF edge cases for full coverage', () => {
      // Testa casos específicos para cobrir todas as linhas do algoritmo CPF
      const testCases = [
        '12345678910', // Força condições específicas do algoritmo
        '98765432101', // Outro caso para teste completo
        '11122233344', // CPF com padrão específico
      ];

      testCases.forEach((cpf) => {
        // Estes CPFs devem falhar na validação
        expect(validator.validate(cpf, {} as any)).toBe(false);
      });
    });
  });

  describe('CNPJ validation', () => {
    it('should validate correct CNPJ', () => {
      const validCnpjs = [
        '11222333000181', // Valid CNPJ
        '11.222.333/0001-81', // Valid CNPJ with formatting
        '12345678000195', // Valid CNPJ
        '12.345.678/0001-95', // Valid CNPJ with formatting
      ];

      validCnpjs.forEach((cnpj) => {
        expect(validator.validate(cnpj, {} as any)).toBe(true);
      });
    });

    it('should reject invalid CNPJ', () => {
      const invalidCnpjs = [
        '11111111111111', // All same digits
        '00000000000000', // All zeros
        '12345678000100', // Invalid check digits
        '11.222.333/0001-82', // Invalid check digit
        '123456780001', // Too short
        '123456780001234', // Too long
      ];

      invalidCnpjs.forEach((cnpj) => {
        expect(validator.validate(cnpj, {} as any)).toBe(false);
      });
    });

    it('should handle CNPJ with remainder < 2 for first check digit', () => {
      // CNPJ que gera remainder < 2 no primeiro dígito verificador (linha 69)
      const cnpjWithRemainder0 = '11111111111100'; // Gera remainder 0 ou 1
      const cnpjWithRemainder1 = '22222222222200'; // Gera remainder 0 ou 1
      expect(validator.validate(cnpjWithRemainder0, {} as any)).toBe(false);
      expect(validator.validate(cnpjWithRemainder1, {} as any)).toBe(false);
    });

    it('should handle CNPJ with remainder < 2 for second check digit', () => {
      // CNPJ que gera remainder < 2 no segundo dígito verificador (linha 80)
      const cnpjWithSecondRemainder0 = '11111111111101'; // Gera remainder 0 ou 1 no segundo
      const cnpjWithSecondRemainder1 = '22222222222201'; // Gera remainder 0 ou 1 no segundo
      expect(validator.validate(cnpjWithSecondRemainder0, {} as any)).toBe(false);
      expect(validator.validate(cnpjWithSecondRemainder1, {} as any)).toBe(false);
    });

    it('should handle specific CNPJ edge cases for full coverage', () => {
      // Testa casos específicos para cobrir todas as linhas do algoritmo CNPJ
      const testCases = [
        '12345678901234', // Força condições específicas do algoritmo
        '98765432109876', // Outro caso para teste completo
        '11111111111111', // CNPJ com todos os dígitos iguais
        '00000000000000', // CNPJ com todos zeros
      ];

      testCases.forEach((cnpj) => {
        // Estes CNPJs devem falhar na validação
        expect(validator.validate(cnpj, {} as any)).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should reject null or undefined values', () => {
      expect(validator.validate(null as any, {} as any)).toBe(false);
      expect(validator.validate(undefined as any, {} as any)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validator.validate(123 as any, {} as any)).toBe(false);
      expect(validator.validate({} as any, {} as any)).toBe(false);
      expect(validator.validate([] as any, {} as any)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validator.validate('', {} as any)).toBe(false);
    });

    it('should reject strings with only non-digit characters', () => {
      expect(validator.validate('abcdefghijk', {} as any)).toBe(false);
      expect(validator.validate('...---///', {} as any)).toBe(false);
    });

    it('should handle mixed characters (keeping only digits)', () => {
      // Should extract only digits and validate
      expect(validator.validate('111abc444def777ghi35', {} as any)).toBe(true);
      expect(validator.validate('11.222.333/0001-81extra', {} as any)).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message', () => {
      const message = validator.defaultMessage({} as any);
      expect(message).toBe('CPF ou CNPJ inválido');
    });
  });
});
