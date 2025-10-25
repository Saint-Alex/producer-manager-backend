import { plainToClass } from 'class-transformer';
import { SafraResponseDto } from './safra-response.dto';

describe('SafraResponseDto', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');

  describe('class instantiation', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ano: 2023,
        createdAt: mockDate,
        updatedAt: mockDate
      };

      const dto = plainToClass(SafraResponseDto, data);

      expect(dto).toBeInstanceOf(SafraResponseDto);
      expect(dto.id).toBe(data.id);
      expect(dto.ano).toBe(data.ano);
      expect(dto.createdAt).toEqual(data.createdAt);
      expect(dto.updatedAt).toEqual(data.updatedAt);
    });

    it('should handle partial data', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ano: 2024
      };

      const dto = plainToClass(SafraResponseDto, data);

      expect(dto.id).toBe(data.id);
      expect(dto.ano).toBe(data.ano);
      expect(dto.createdAt).toBeUndefined();
      expect(dto.updatedAt).toBeUndefined();
    });

    it('should handle different years correctly', () => {
      const years = [2020, 2021, 2022, 2023, 2024, 2025];

      years.forEach(year => {
        const data = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nome: `Safra ${year}`,
          ano: year
        };
        const dto = plainToClass(SafraResponseDto, data);

        expect(dto.ano).toBe(year);
        expect(typeof dto.ano).toBe('number');
      });
    });

    it('should handle safra variations by year', () => {
      const years = [2020, 2021, 2022, 2023, 2024, 2025];

      years.forEach(ano => {
        const data = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          ano
        };
        const dto = plainToClass(SafraResponseDto, data);

        expect(dto.ano).toBe(ano);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const dto = plainToClass(SafraResponseDto, {});

      expect(dto).toBeInstanceOf(SafraResponseDto);
      expect(dto.id).toBeUndefined();
      expect(dto.ano).toBeUndefined();
    });

    it('should handle null values', () => {
      const data = {
        id: null,
        ano: null,
        createdAt: null,
        updatedAt: null
      };
      const dto = plainToClass(SafraResponseDto, data);

      expect(dto.id).toBeNull();
      expect(dto.ano).toBeNull();
      expect(dto.createdAt).toBeNull();
      expect(dto.updatedAt).toBeNull();
    });

    it('should handle boundary year values', () => {
      const boundaryData = [
        { ano: 2000, expected: 2000 },
        { ano: 2050, expected: 2050 },
        { ano: 2023.5, expected: 2023.5 } // decimal years
      ];

      boundaryData.forEach(({ ano, expected }) => {
        const data = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          ano
        };
        const dto = plainToClass(SafraResponseDto, data);

        expect(dto.ano).toBe(expected);
      });
    });
  });

  describe('date handling', () => {
    it('should handle string dates', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ano: 2023,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      };

      const dto = plainToClass(SafraResponseDto, data);

      expect(dto.createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(dto.updatedAt).toBe('2023-01-02T00:00:00.000Z');
    });
  });
});
