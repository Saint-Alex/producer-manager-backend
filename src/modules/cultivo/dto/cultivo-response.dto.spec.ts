import { plainToClass } from 'class-transformer';
import { CultivoResponseDto } from './cultivo-response.dto';

describe('CultivoResponseDto', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');

  describe('class instantiation', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        areaCultivada: 150.75,
        createdAt: mockDate,
        updatedAt: mockDate,
        propriedadeRural: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nomeFazenda: 'Fazenda Test',
        },
        cultura: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          nome: 'Soja',
        },
        safra: {
          id: '550e8400-e29b-41d4-a716-446655440003',
          ano: 2023,
        },
      };

      const dto = plainToClass(CultivoResponseDto, data);

      expect(dto).toBeInstanceOf(CultivoResponseDto);
      expect(dto.id).toBe(data.id);
      expect(dto.areaCultivada).toBe(data.areaCultivada);
      expect(dto.createdAt).toEqual(data.createdAt);
      expect(dto.updatedAt).toEqual(data.updatedAt);
    });

    it('should handle partial data', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        areaCultivada: 75.5,
      };

      const dto = plainToClass(CultivoResponseDto, data);

      expect(dto.id).toBe(data.id);
      expect(dto.areaCultivada).toBe(data.areaCultivada);
      expect(dto.createdAt).toBeUndefined();
      expect(dto.updatedAt).toBeUndefined();
    });

    it('should handle numeric area values correctly', () => {
      const areaValues = [0.5, 100, 250.75, 1000.25, 5000];

      areaValues.forEach((areaCultivada) => {
        const data = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          areaCultivada,
        };
        const dto = plainToClass(CultivoResponseDto, data);

        expect(dto.areaCultivada).toBe(areaCultivada);
        expect(typeof dto.areaCultivada).toBe('number');
      });
    });
  });

  describe('relationship handling', () => {
    it('should handle propriedadeRural relationship', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        areaCultivada: 100,
        propriedadeRural: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nomeFazenda: 'Fazenda Relacionamento',
        },
      };

      const dto = plainToClass(CultivoResponseDto, data);

      expect(dto.propriedadeRural).toBeDefined();
      expect(dto.propriedadeRural.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(dto.propriedadeRural.nomeFazenda).toBe('Fazenda Relacionamento');
    });

    it('should handle missing relationships', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        areaCultivada: 100,
      };

      const dto = plainToClass(CultivoResponseDto, data);

      expect(dto.propriedadeRural).toBeUndefined();
      expect(dto.cultura).toBeUndefined();
      expect(dto.safra).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const dto = plainToClass(CultivoResponseDto, {});

      expect(dto).toBeInstanceOf(CultivoResponseDto);
      expect(dto.id).toBeUndefined();
      expect(dto.areaCultivada).toBeUndefined();
    });

    it('should handle null values', () => {
      const data = {
        id: null,
        areaCultivada: null,
        createdAt: null,
        updatedAt: null,
        propriedadeRural: null,
        cultura: null,
        safra: null,
      };
      const dto = plainToClass(CultivoResponseDto, data);

      expect(dto.id).toBeNull();
      expect(dto.areaCultivada).toBeNull();
      expect(dto.createdAt).toBeNull();
      expect(dto.updatedAt).toBeNull();
      expect(dto.propriedadeRural).toBeNull();
      expect(dto.cultura).toBeNull();
      expect(dto.safra).toBeNull();
    });

    it('should handle zero area cultiva', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        areaCultivada: 0,
      };

      const dto = plainToClass(CultivoResponseDto, data);
      expect(dto.areaCultivada).toBe(0);
    });

    it('should handle very large area values', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        areaCultivada: 999999.99,
      };

      const dto = plainToClass(CultivoResponseDto, data);
      expect(dto.areaCultivada).toBe(999999.99);
    });
  });

  describe('date handling', () => {
    it('should handle string dates', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        areaCultivada: 100,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      const dto = plainToClass(CultivoResponseDto, data);

      expect(dto.createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(dto.updatedAt).toBe('2023-01-02T00:00:00.000Z');
    });
  });
});
