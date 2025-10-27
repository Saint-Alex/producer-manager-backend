import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../shared/config/database.config';

// Carregar variáveis de ambiente do arquivo .env
config();

// Script para limpar todas as tabelas antes de executar os seeds
const clearDatabase = async () => {
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
  });

  try {
    console.log('🗑️  Iniciando limpeza do banco de dados...\n');

    await dataSource.initialize();
    console.log('✅ Conexão com o banco estabelecida!\n');

    // Desabilitar constraints temporariamente para evitar problemas de FK
    await dataSource.query('SET session_replication_role = replica;');

    // Limpar tabelas na ordem inversa das dependências
    const tablesToClear = [
      'cultivos',
      'produtor_propriedade',
      'propriedades_rurais',
      'produtores',
      'safras',
      'culturas',
    ];

    console.log('🧹 Limpando tabelas...');
    for (const table of tablesToClear) {
      try {
        await dataSource.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`);
        console.log(`   ✅ Tabela "${table}" limpa`);
      } catch (error) {
        console.log(`   ⚠️  Tabela "${table}" não encontrada ou já vazia`);
      }
    }

    // Reabilitar constraints
    await dataSource.query('SET session_replication_role = DEFAULT;');

    console.log('\n🎉 Banco de dados limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexão com o banco fechada.');
  }
};

// Executar limpeza se chamado diretamente
if (require.main === module) {
  clearDatabase();
}

export { clearDatabase };
