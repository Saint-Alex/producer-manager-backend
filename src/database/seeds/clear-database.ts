import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// Script para limpar todas as tabelas antes de executar os seeds
const clearDatabase = async () => {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USERNAME', 'brainag_user'),
    password: configService.get('DATABASE_PASSWORD', 'brainag_pass'),
    database: configService.get('DATABASE_NAME', 'brainag_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
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
