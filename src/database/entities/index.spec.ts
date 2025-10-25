import { Cultivo, Cultura, Produtor, PropriedadeRural, Safra } from './index';

describe('Database Entities Index', () => {
  it('should export Cultivo entity', () => {
    expect(Cultivo).toBeDefined();
    expect(typeof Cultivo).toBe('function');
  });

  it('should export Cultura entity', () => {
    expect(Cultura).toBeDefined();
    expect(typeof Cultura).toBe('function');
  });

  it('should export Produtor entity', () => {
    expect(Produtor).toBeDefined();
    expect(typeof Produtor).toBe('function');
  });

  it('should export PropriedadeRural entity', () => {
    expect(PropriedadeRural).toBeDefined();
    expect(typeof PropriedadeRural).toBe('function');
  });

  it('should export Safra entity', () => {
    expect(Safra).toBeDefined();
    expect(typeof Safra).toBe('function');
  });

  it('should allow creating instances of exported entities', () => {
    const cultivo = new Cultivo();
    const cultura = new Cultura();
    const produtor = new Produtor();
    const propriedade = new PropriedadeRural();
    const safra = new Safra();

    expect(cultivo).toBeInstanceOf(Cultivo);
    expect(cultura).toBeInstanceOf(Cultura);
    expect(produtor).toBeInstanceOf(Produtor);
    expect(propriedade).toBeInstanceOf(PropriedadeRural);
    expect(safra).toBeInstanceOf(Safra);
  });
});
