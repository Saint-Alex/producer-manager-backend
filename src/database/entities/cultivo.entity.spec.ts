import { Cultivo } from './cultivo.entity';
import { Cultura } from './cultura.entity';
import { PropriedadeRural } from './propriedade-rural.entity';
import { Safra } from './safra.entity';

describe('Cultivo Entity', () => {
  let cultivo: Cultivo;

  beforeEach(() => {
    cultivo = new Cultivo();
  });

  it('should be defined', () => {
    expect(cultivo).toBeDefined();
  });

  it('should have initial properties', () => {
    expect(cultivo.id).toBeUndefined();
    expect(cultivo.areaPlantada).toBeUndefined();
    expect(cultivo.propriedadeRural).toBeUndefined();
    expect(cultivo.cultura).toBeUndefined();
    expect(cultivo.safra).toBeUndefined();
    expect(cultivo.createdAt).toBeUndefined();
    expect(cultivo.updatedAt).toBeUndefined();
  });

  it('should allow setting properties', () => {
    const testId = 'test-uuid';
    const testArea = 100.5;
    const testPropriedade = new PropriedadeRural();
    const testCultura = new Cultura();
    const testSafra = new Safra();
    const testDate = new Date();

    cultivo.id = testId;
    cultivo.areaPlantada = testArea;
    cultivo.propriedadeRural = testPropriedade;
    cultivo.cultura = testCultura;
    cultivo.safra = testSafra;
    cultivo.createdAt = testDate;
    cultivo.updatedAt = testDate;

    expect(cultivo.id).toBe(testId);
    expect(cultivo.areaPlantada).toBe(testArea);
    expect(cultivo.propriedadeRural).toBe(testPropriedade);
    expect(cultivo.cultura).toBe(testCultura);
    expect(cultivo.safra).toBe(testSafra);
    expect(cultivo.createdAt).toBe(testDate);
    expect(cultivo.updatedAt).toBe(testDate);
  });

  it('should create instance with constructor', () => {
    const newCultivo = new Cultivo();
    expect(newCultivo).toBeInstanceOf(Cultivo);
  });

  it('should handle relationship with propriedadeRural', () => {
    const propriedade = new PropriedadeRural();
    propriedade.nomeFazenda = 'Fazenda Teste';

    cultivo.propriedadeRural = propriedade;

    expect(cultivo.propriedadeRural).toBe(propriedade);
    expect(cultivo.propriedadeRural.nomeFazenda).toBe('Fazenda Teste');
  });

  it('should handle relationship with cultura', () => {
    const cultura = new Cultura();
    cultura.nome = 'Soja';

    cultivo.cultura = cultura;

    expect(cultivo.cultura).toBe(cultura);
    expect(cultivo.cultura.nome).toBe('Soja');
  });

  it('should handle relationship with safra', () => {
    const safra = new Safra();
    safra.ano = 2024;

    cultivo.safra = safra;

    expect(cultivo.safra).toBe(safra);
    expect(cultivo.safra.ano).toBe(2024);
  });

  it('should handle numeric area values', () => {
    cultivo.areaPlantada = 150.75;
    expect(cultivo.areaPlantada).toBe(150.75);
    expect(typeof cultivo.areaPlantada).toBe('number');
  });

  it('should allow undefined values', () => {
    cultivo.id = undefined;
    cultivo.areaPlantada = undefined;
    cultivo.propriedadeRural = undefined;
    cultivo.cultura = undefined;
    cultivo.safra = undefined;

    expect(cultivo.id).toBeUndefined();
    expect(cultivo.areaPlantada).toBeUndefined();
    expect(cultivo.propriedadeRural).toBeUndefined();
    expect(cultivo.cultura).toBeUndefined();
    expect(cultivo.safra).toBeUndefined();
  });
});
