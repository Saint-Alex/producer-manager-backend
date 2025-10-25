import { plainToClass } from 'class-transformer';
import { ProdutorResponseDto, PropriedadeResponseDto } from './produtor-response.dto';

describe('ProdutorResponseDto', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');

  describe('class instantiation', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpfCnpj: '12345678901',
        nome: 'João Silva Santos',
        createdAt: mockDate,
        updatedAt: mockDate,
        propriedades: [],
      };

      const dto = plainToClass(ProdutorResponseDto, data);

      expect(dto).toBeInstanceOf(ProdutorResponseDto);
      expect(dto.id).toBe(data.id);
      expect(dto.cpfCnpj).toBe(data.cpfCnpj);
      expect(dto.nome).toBe(data.nome);
      expect(dto.createdAt).toEqual(data.createdAt);
      expect(dto.updatedAt).toEqual(data.updatedAt);
      expect(dto.propriedades).toEqual([]);
    });

    it('should handle partial data', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Maria Santos',
        cpfCnpj: '98765432100',
      };

      const dto = plainToClass(ProdutorResponseDto, data);

      expect(dto.id).toBe(data.id);
      expect(dto.nome).toBe(data.nome);
      expect(dto.cpfCnpj).toBe(data.cpfCnpj);
      expect(dto.propriedades).toBeUndefined();
    });

    it('should handle propriedades transformation', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Carlos Silva',
        cpfCnpj: '11122233344',
        createdAt: mockDate,
        updatedAt: mockDate,
        propriedades: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            nomeFazenda: 'Fazenda Esperança',
            cidade: 'Ribeirão Preto',
            estado: 'SP',
            areaTotal: 1000.5,
          },
        ],
      };

      const dto = plainToClass(ProdutorResponseDto, data);

      expect(dto.propriedades).toHaveLength(1);
      expect(dto.propriedades[0]).toBeInstanceOf(PropriedadeResponseDto);
      expect(dto.propriedades[0].nomeFazenda).toBe('Fazenda Esperança');
      expect(dto.propriedades[0].areaTotal).toBe(1000.5);
    });
  });

  describe('property exposure', () => {
    it('should expose all expected properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        cpfCnpj: '12345678901',
        nome: 'João Silva Santos',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const dto = plainToClass(ProdutorResponseDto, data);

      expect(dto.id).toBeDefined();
      expect(dto.cpfCnpj).toBeDefined();
      expect(dto.nome).toBeDefined();
      expect(dto.createdAt).toBeDefined();
      expect(dto.updatedAt).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const dto = plainToClass(ProdutorResponseDto, {});

      expect(dto).toBeInstanceOf(ProdutorResponseDto);
      expect(dto.id).toBeUndefined();
      expect(dto.nome).toBeUndefined();
      expect(dto.cpfCnpj).toBeUndefined();
    });

    it('should handle null values', () => {
      const data = {
        id: null,
        nome: null,
        cpfCnpj: null,
        propriedades: null,
      };

      const dto = plainToClass(ProdutorResponseDto, data);

      expect(dto.id).toBeNull();
      expect(dto.nome).toBeNull();
      expect(dto.cpfCnpj).toBeNull();
      expect(dto.propriedades).toBeNull();
    });
  });
});

describe('PropriedadeResponseDto', () => {
  describe('class instantiation', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda São João',
        cidade: 'Uberlândia',
        estado: 'MG',
        areaTotal: 500.75,
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto).toBeInstanceOf(PropriedadeResponseDto);
      expect(dto.id).toBe(data.id);
      expect(dto.nomeFazenda).toBe(data.nomeFazenda);
      expect(dto.cidade).toBe(data.cidade);
      expect(dto.estado).toBe(data.estado);
      expect(dto.areaTotal).toBe(data.areaTotal);
    });

    it('should handle partial data', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Parcial',
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.id).toBe(data.id);
      expect(dto.nomeFazenda).toBe(data.nomeFazenda);
      expect(dto.cidade).toBeUndefined();
      expect(dto.estado).toBeUndefined();
      expect(dto.areaTotal).toBeUndefined();
    });

    it('should handle numeric area values', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Numérica',
        cidade: 'São Paulo',
        estado: 'SP',
        areaTotal: 1234.56,
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.areaTotal).toBe(1234.56);
      expect(typeof dto.areaTotal).toBe('number');
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const dto = plainToClass(PropriedadeResponseDto, {});

      expect(dto).toBeInstanceOf(PropriedadeResponseDto);
      expect(dto.id).toBeUndefined();
      expect(dto.nomeFazenda).toBeUndefined();
    });

    it('should handle null values', () => {
      const data = {
        id: null,
        nomeFazenda: null,
        areaTotal: null,
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.id).toBeNull();
      expect(dto.nomeFazenda).toBeNull();
      expect(dto.areaTotal).toBeNull();
    });
  });
});
