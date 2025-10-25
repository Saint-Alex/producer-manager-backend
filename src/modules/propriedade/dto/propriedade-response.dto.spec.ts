import { plainToClass } from 'class-transformer';
import { PropriedadeResponseDto } from './propriedade-response.dto';

describe('PropriedadeResponseDto', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');

  describe('class instantiation', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda São João',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 1000.5,
        areaAgricultavel: 600.0,
        areaVegetacao: 400.5,
        produtores: [
          { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'João', cpfCnpj: '12345678901' },
          { id: '550e8400-e29b-41d4-a716-446655440002', nome: 'Maria', cpfCnpj: '98765432100' }
        ],
        createdAt: mockDate,
        updatedAt: mockDate
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto).toBeInstanceOf(PropriedadeResponseDto);
      expect(dto.id).toBe(data.id);
      expect(dto.nomeFazenda).toBe(data.nomeFazenda);
      expect(dto.cidade).toBe(data.cidade);
      expect(dto.estado).toBe(data.estado);
      expect(dto.areaTotal).toBe(data.areaTotal);
      expect(dto.areaAgricultavel).toBe(data.areaAgricultavel);
      expect(dto.areaVegetacao).toBe(data.areaVegetacao);
    });

    it('should handle partial data', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Parcial',
        areaTotal: 500
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.id).toBe(data.id);
      expect(dto.nomeFazenda).toBe(data.nomeFazenda);
      expect(dto.areaTotal).toBe(data.areaTotal);
      expect(dto.cidade).toBeUndefined();
      expect(dto.estado).toBeUndefined();
    });

    it('should handle numeric area values correctly', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Numérica',
        areaTotal: 1234.56,
        areaAgricultavel: 800.25,
        areaVegetacao: 434.31
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.areaTotal).toBe(1234.56);
      expect(dto.areaAgricultavel).toBe(800.25);
      expect(dto.areaVegetacao).toBe(434.31);
      expect(typeof dto.areaTotal).toBe('number');
      expect(typeof dto.areaAgricultavel).toBe('number');
      expect(typeof dto.areaVegetacao).toBe('number');
    });
  });

  describe('array handling', () => {
    it('should handle produtores array', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda com Múltiplos Produtores',
        produtores: [
          { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'João', cpfCnpj: '12345678901' },
          { id: '550e8400-e29b-41d4-a716-446655440002', nome: 'Maria', cpfCnpj: '98765432100' }
        ]
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.produtores).toHaveLength(2);
      expect(dto.produtores[0].id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(dto.produtores[1].nome).toBe('Maria');
    });

    it('should handle empty produtores array', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Sem Produtores',
        produtores: []
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.produtores).toEqual([]);
      expect(Array.isArray(dto.produtores)).toBe(true);
    });
  });

  describe('date handling', () => {
    it('should handle date properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda com Datas',
        createdAt: mockDate,
        updatedAt: mockDate
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.createdAt).toEqual(mockDate);
      expect(dto.updatedAt).toEqual(mockDate);
    });

    it('should handle string dates', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda com String Dates',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(dto.updatedAt).toBe('2023-01-02T00:00:00.000Z');
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const dto = plainToClass(PropriedadeResponseDto, {});

      expect(dto).toBeInstanceOf(PropriedadeResponseDto);
      expect(dto.id).toBeUndefined();
      expect(dto.nomeFazenda).toBeUndefined();
      expect(dto.areaTotal).toBeUndefined();
    });

    it('should handle null values', () => {
      const data = {
        id: null,
        nomeFazenda: null,
        areaTotal: null,
        produtores: null
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.id).toBeNull();
      expect(dto.nomeFazenda).toBeNull();
      expect(dto.areaTotal).toBeNull();
      expect(dto.produtores).toBeNull();
    });

    it('should handle zero area values', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Zero',
        areaTotal: 0,
        areaAgricultavel: 0,
        areaVegetacao: 0
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.areaTotal).toBe(0);
      expect(dto.areaAgricultavel).toBe(0);
      expect(dto.areaVegetacao).toBe(0);
    });
  });

  describe('location data', () => {
    it('should handle Brazilian states and cities', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Brasil',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.cidade).toBe('São Paulo');
      expect(dto.estado).toBe('SP');
    });

    it('should handle special characters in location names', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda São José do Rio Preto',
        cidade: 'Brasília',
        estado: 'DF'
      };

      const dto = plainToClass(PropriedadeResponseDto, data);

      expect(dto.nomeFazenda).toBe('Fazenda São José do Rio Preto');
      expect(dto.cidade).toBe('Brasília');
      expect(dto.estado).toBe('DF');
    });
  });
});
