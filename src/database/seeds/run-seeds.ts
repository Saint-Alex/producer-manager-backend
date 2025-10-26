import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { CultivoSeeder } from './cultivo.seeder';
import { CulturaSeeder } from './cultura.seeder';
import { ProdutorSeeder } from './produtor.seeder';
import { PropriedadeRuralSeeder } from './propriedade-rural.seeder';
import { SafraSeeder } from './safra.seeder';

// Configuração manual do DataSource para seeds
const runSeeds = async () => {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USERNAME', 'brainag_user'),
    password: configService.get('DATABASE_PASSWORD', 'brainag_pass'),
    database: configService.get('DATABASE_NAME', 'brainag_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Não usar synchronize em produção
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
