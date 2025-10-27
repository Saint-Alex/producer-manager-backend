import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../shared/config/database.config';
import { CultivoSeeder } from './cultivo.seeder';
import { CulturaSeeder } from './cultura.seeder';
import { ProdutorSeeder } from './produtor.seeder';
import { PropriedadeRuralSeeder } from './propriedade-rural.seeder';
import { SafraSeeder } from './safra.seeder';

// Carregar variáveis de ambiente do arquivo .env
config();

// Configuração manual do DataSource para seeds
const runSeeds = async () => {
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
    synchronize: false, // Não usar synchronize em produção
    logging: process.env.NODE_ENV === 'development',
  });

  try {
    console.log('🌱 Iniciando execução dos seeds...\n');

    await dataSource.initialize();
    console.log('✅ Conexão com o banco estabelecida!\n');

    // Executar seeds na ordem correta (respeitando dependências)
    console.log('=================================');
    console.log('🚀 EXECUTANDO SEEDS COMPLETOS');
    console.log('=================================\n');

    await CulturaSeeder.run(dataSource);
    await ProdutorSeeder.run(dataSource);
    await PropriedadeRuralSeeder.run(dataSource);
    await SafraSeeder.run(dataSource);
    await CultivoSeeder.run(dataSource);

    console.log('=================================');
    console.log('🎉 TODOS OS SEEDS EXECUTADOS COM SUCESSO!');
    console.log('=================================');
    console.log('📊 Dados criados:');
    console.log('   - Culturas: 23 tipos de culturas brasileiras');
    console.log('   - Safras: 13 anos (2014-2026)');
    console.log('   - Produtores: 8 produtores (PF e PJ)');
    console.log('   - Propriedades: 12 fazendas em diferentes estados');
    console.log('   - Cultivos: 25+ cultivos distribuídos pelas propriedades');
    console.log('=================================');
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexão com o banco fechada.');
    process.exit(0);
  }
};

// Executar seeds se chamado diretamente
if (require.main === module) {
  runSeeds();
}

export { runSeeds };
