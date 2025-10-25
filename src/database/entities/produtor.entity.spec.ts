import { Produtor } from './produtor.entity';
import { PropriedadeRural } from './propriedade-rural.entity';

describe('Produtor Entity', () => {
  let produtor: Produtor;

  beforeEach(() => {
    produtor = new Produtor();
  });

  it('should be defined', () => {
    expect(produtor).toBeDefined();
  });

  it('should have initial properties', () => {
    expect(produtor.id).toBeUndefined();
    expect(produtor.cpfCnpj).toBeUndefined();
    expect(produtor.nome).toBeUndefined();
    expect(produtor.propriedades).toBeUndefined();
    expect(produtor.createdAt).toBeUndefined();
    expect(produtor.updatedAt).toBeUndefined();
  });

  it('should allow setting properties', () => {
    const testId = 'test-uuid';
    const testCpf = '12345678901';
    const testNome = 'João Silva';
    const testDate = new Date();
    const testPropriedades: PropriedadeRural[] = [];

    produtor.id = testId;
    produtor.cpfCnpj = testCpf;
    produtor.nome = testNome;
    produtor.propriedades = testPropriedades;
    produtor.createdAt = testDate;
    produtor.updatedAt = testDate;

    expect(produtor.id).toBe(testId);
    expect(produtor.cpfCnpj).toBe(testCpf);
    expect(produtor.nome).toBe(testNome);
    expect(produtor.propriedades).toBe(testPropriedades);
    expect(produtor.createdAt).toBe(testDate);
    expect(produtor.updatedAt).toBe(testDate);
  });

  it('should create instance with constructor', () => {
    const newProdutor = new Produtor();
    expect(newProdutor).toBeInstanceOf(Produtor);
  });

  it('should handle relationship with propriedades', () => {
    const propriedade1 = new PropriedadeRural();
    const propriedade2 = new PropriedadeRural();

    produtor.propriedades = [propriedade1, propriedade2];

    expect(produtor.propriedades).toHaveLength(2);
    expect(produtor.propriedades[0]).toBe(propriedade1);
    expect(produtor.propriedades[1]).toBe(propriedade2);
  });

  it('should allow undefined values', () => {
    produtor.id = undefined;
    produtor.cpfCnpj = undefined;
    produtor.nome = undefined;
    produtor.propriedades = undefined;

    expect(produtor.id).toBeUndefined();
    expect(produtor.cpfCnpj).toBeUndefined();
    expect(produtor.nome).toBeUndefined();
    expect(produtor.propriedades).toBeUndefined();
  });
});
