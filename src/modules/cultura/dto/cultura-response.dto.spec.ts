import { plainToClass } from 'class-transformer';
import { CulturaResponseDto } from './cultura-response.dto';

describe('CulturaResponseDto', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');

  describe('class instantiation', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Soja',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const dto = plainToClass(CulturaResponseDto, data);

      expect(dto).toBeInstanceOf(CulturaResponseDto);
      expect(dto.id).toBe(data.id);
      expect(dto.nome).toBe(data.nome);
      expect(dto.createdAt).toEqual(data.createdAt);
      expect(dto.updatedAt).toEqual(data.updatedAt);
    });

    it('should handle partial data', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Milho',
      };

      const dto = plainToClass(CulturaResponseDto, data);

      expect(dto.id).toBe(data.id);
      expect(dto.nome).toBe(data.nome);
      expect(dto.createdAt).toBeUndefined();
      expect(dto.updatedAt).toBeUndefined();
    });

    it('should handle different culture names', () => {
      const cultures = ['Soja', 'Milho', 'Algodão', 'Café', 'Cana-de-açúcar'];

      cultures.forEach((cultureName) => {
        const data = { id: '550e8400-e29b-41d4-a716-446655440000', nome: cultureName };
        const dto = plainToClass(CulturaResponseDto, data);

        expect(dto.nome).toBe(cultureName);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const dto = plainToClass(CulturaResponseDto, {});

      expect(dto).toBeInstanceOf(CulturaResponseDto);
      expect(dto.id).toBeUndefined();
      expect(dto.nome).toBeUndefined();
    });

    it('should handle null values', () => {
      const data = { id: null, nome: null, createdAt: null, updatedAt: null };
      const dto = plainToClass(CulturaResponseDto, data);

      expect(dto.id).toBeNull();
      expect(dto.nome).toBeNull();
      expect(dto.createdAt).toBeNull();
      expect(dto.updatedAt).toBeNull();
    });

    it('should handle special characters in nome', () => {
      const data = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Açaí',
      };

      const dto = plainToClass(CulturaResponseDto, data);
      expect(dto.nome).toBe('Açaí');
    });
  });
});
