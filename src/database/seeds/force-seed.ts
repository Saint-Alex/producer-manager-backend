import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../shared/config/database.config';

// Carregar variáveis de ambiente do arquivo .env
config();

const forceSeed = async () => {
  const dbConfig = getDatabaseConfig();

  console.log('🔧 Configuração do banco:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   SSL: ${dbConfig.ssl}`);
  console.log(`   DATABASE_URL presente: ${!!process.env.DATABASE_URL}`);
  console.log('');

  const dataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    console.log('🌱 Forçando inserção de dados no banco...\n');

    await dataSource.initialize();
    console.log('✅ Conexão estabelecida!\n');

    // Inserir culturas usando SQL direto
    console.log('🌱 Inserindo culturas...');
    await dataSource.query(`
      INSERT INTO culturas (nome, descricao) VALUES
      ('Soja', 'Cultura de soja para produção de grãos'),
      ('Milho', 'Cultura de milho para produção de grãos'),
      ('Café', 'Cultura de café para produção de bebidas'),
      ('Cana-de-açúcar', 'Cultura de cana para produção de açúcar e etanol'),
      ('Algodão', 'Cultura de algodão para produção de fibras'),
      ('Arroz', 'Cultura de arroz para produção de grãos'),
      ('Feijão', 'Cultura de feijão para produção de grãos'),
      ('Trigo', 'Cultura de trigo para produção de farinha')
      ON CONFLICT (nome) DO NOTHING;
    `);

    // Inserir produtores
    console.log('👨‍🌾 Inserindo produtores...');
    await dataSource.query(`
      INSERT INTO produtores (cpf_cnpj, nome) VALUES
      ('12345678901', 'João Silva'),
      ('98765432100', 'Maria Santos'),
      ('11222333000181', 'Fazenda Boa Vista LTDA'),
      ('55444333000122', 'Agropecuária Três Irmãos LTDA'),
      ('45678912345', 'Carlos Oliveira'),
      ('78912345678', 'Ana Costa'),
      ('66777888000199', 'Rural São Paulo LTDA'),
      ('32165498765', 'Pedro Almeida')
      ON CONFLICT (cpf_cnpj) DO NOTHING;
    `);

    // Inserir propriedades rurais
    console.log('🏡 Inserindo propriedades rurais...');
    await dataSource.query(`
      INSERT INTO propriedades_rurais (nome_fazenda, cidade, estado, area_total, area_agricultavel, area_vegetacao) VALUES
      ('Fazenda Boa Esperança', 'Ribeirão Preto', 'SP', 1200.50, 800.30, 400.20),
      ('Sítio da Cachoeira', 'Uberlândia', 'MG', 450.75, 300.50, 150.25),
      ('Fazenda Santa Maria', 'Campo Grande', 'MS', 2500.00, 1800.00, 700.00),
      ('Estância Água Limpa', 'Cuiabá', 'MT', 5000.25, 3500.75, 1499.50),
      ('Fazenda Rio Verde', 'Rio Verde', 'GO', 3200.80, 2400.60, 800.20),
      ('Chácara Três Palmeiras', 'Barretos', 'SP', 180.30, 120.20, 60.10),
      ('Fazenda Cerrado Azul', 'Brasília', 'DF', 1800.00, 1300.00, 500.00),
      ('Sítio do Ipê', 'Londrina', 'PR', 650.40, 480.30, 170.10),
      ('Fazenda Vale do Sol', 'Passo Fundo', 'RS', 2200.90, 1650.70, 550.20),
      ('Estância Beira Rio', 'São Luís', 'MA', 3800.60, 2850.45, 950.15);
    `);

    // Buscar IDs das propriedades para inserir safras
    const propriedades = await dataSource.query(`
      SELECT id, nome_fazenda FROM propriedades_rurais ORDER BY nome_fazenda;
    `);

    console.log('📅 Inserindo safras...');
    for (const prop of propriedades) {
      await dataSource.query(`
        INSERT INTO safras (nome, ano, propriedade_rural_id, data_inicio, data_fim) VALUES
        ('Safra 2025 - ${prop.nome_fazenda}', 2025, '${prop.id}', '2025-01-01', '2025-12-31'),
        ('Safra 2024 - ${prop.nome_fazenda}', 2024, '${prop.id}', '2024-01-01', '2024-12-31'),
        ('Safra 2023 - ${prop.nome_fazenda}', 2023, '${prop.id}', '2023-01-01', '2023-12-31');
      `);
    }

    // Associar produtores às propriedades na tabela de junção
    console.log('🔗 Associando produtores às propriedades...');

    const produtoresMap = await dataSource.query(`
      SELECT id, cpf_cnpj FROM produtores;
    `);

    const propriedadesMap = await dataSource.query(`
      SELECT id, nome_fazenda FROM propriedades_rurais;
    `);

    // Mapeamento de associações produtor-propriedade
    const associacoes = [
      { cpf: '12345678901', fazendas: ['Fazenda Boa Esperança', 'Sítio da Cachoeira'] },
      { cpf: '98765432100', fazendas: ['Fazenda Santa Maria'] },
      { cpf: '11222333000181', fazendas: ['Estância Água Limpa', 'Fazenda Rio Verde'] },
      { cpf: '55444333000122', fazendas: ['Chácara Três Palmeiras'] },
      { cpf: '45678912345', fazendas: ['Fazenda Cerrado Azul', 'Sítio do Ipê'] },
      { cpf: '78912345678', fazendas: ['Fazenda Vale do Sol'] },
      { cpf: '66777888000199', fazendas: ['Estância Beira Rio'] },
    ];

    for (const assoc of associacoes) {
      const produtor = produtoresMap.find((p) => p.cpf_cnpj === assoc.cpf);
      if (produtor) {
        for (const fazendaNome of assoc.fazendas) {
          const propriedade = propriedadesMap.find((p) => p.nome_fazenda === fazendaNome);
          if (propriedade) {
            await dataSource.query(`
              INSERT INTO produtor_propriedade (produtor_id, propriedade_id) VALUES
              ('${produtor.id}', '${propriedade.id}')
              ON CONFLICT DO NOTHING;
            `);
          }
        }
      }
    }

    // Verificar totais inseridos
    const totais = await dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM culturas) as culturas,
        (SELECT COUNT(*) FROM produtores) as produtores,
        (SELECT COUNT(*) FROM propriedades_rurais) as propriedades,
        (SELECT COUNT(*) FROM safras) as safras,
        (SELECT COUNT(*) FROM produtor_propriedade) as associacoes;
    `);

    console.log('\n=================================');
    console.log('🎉 DADOS INSERIDOS COM SUCESSO!');
    console.log('=================================');
    console.log('📊 Total de registros criados:');
    console.log(`   - Culturas: ${totais[0].culturas}`);
    console.log(`   - Produtores: ${totais[0].produtores}`);
    console.log(`   - Propriedades: ${totais[0].propriedades}`);
    console.log(`   - Safras: ${totais[0].safras}`);
    console.log(`   - Associações P-P: ${totais[0].associacoes}`);
    console.log('=================================');
  } catch (error) {
    console.error('❌ Erro ao executar force seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexão fechada.');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  forceSeed();
}

export { forceSeed };
