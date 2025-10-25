import { Cultivo } from './cultivo.entity';
import { Cultura } from './cultura.entity';

describe('Cultura Entity', () => {
  let cultura: Cultura;

  beforeEach(() => {
    cultura = new Cultura();
  });

  it('should be defined', () => {
    expect(cultura).toBeDefined();
  });

  it('should have initial properties', () => {
    expect(cultura.id).toBeUndefined();
    expect(cultura.nome).toBeUndefined();
    expect(cultura.cultivos).toBeUndefined();
    expect(cultura.createdAt).toBeUndefined();
    expect(cultura.updatedAt).toBeUndefined();
  });

  it('should allow setting properties', () => {
    const testId = 'test-uuid';
    const testNome = 'Soja';
    const testCultivos: Cultivo[] = [];
    const testDate = new Date();

    cultura.id = testId;
    cultura.nome = testNome;
    cultura.cultivos = testCultivos;
    cultura.createdAt = testDate;
    cultura.updatedAt = testDate;

    expect(cultura.id).toBe(testId);
    expect(cultura.nome).toBe(testNome);
    expect(cultura.cultivos).toBe(testCultivos);
    expect(cultura.createdAt).toBe(testDate);
    expect(cultura.updatedAt).toBe(testDate);
  });

  it('should create instance with constructor', () => {
    const newCultura = new Cultura();
    expect(newCultura).toBeInstanceOf(Cultura);
  });

  it('should handle relationship with cultivos', () => {
    const cultivo1 = new Cultivo();
    const cultivo2 = new Cultivo();

    cultura.cultivos = [cultivo1, cultivo2];

    expect(cultura.cultivos).toHaveLength(2);
    expect(cultura.cultivos[0]).toBe(cultivo1);
    expect(cultura.cultivos[1]).toBe(cultivo2);
  });

  it('should handle string nome values', () => {
    cultura.nome = 'Milho Transgênico';
    expect(cultura.nome).toBe('Milho Transgênico');
    expect(typeof cultura.nome).toBe('string');
  });

  it('should allow undefined values', () => {
    cultura.id = undefined;
    cultura.nome = undefined;
    cultura.cultivos = undefined;

    expect(cultura.id).toBeUndefined();
    expect(cultura.nome).toBeUndefined();
    expect(cultura.cultivos).toBeUndefined();
  });

  it('should handle empty cultivos array', () => {
    cultura.cultivos = [];
    expect(cultura.cultivos).toHaveLength(0);
    expect(Array.isArray(cultura.cultivos)).toBe(true);
  });
});
