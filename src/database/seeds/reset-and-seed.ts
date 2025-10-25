import { clearDatabase } from './clear-database';
import { runSeeds } from './run-seeds';

// Script principal que limpa o banco e executa todos os seeds
const resetAndSeed = async () => {
  try {
    console.log('🚀 INICIANDO RESET COMPLETO DO BANCO DE DADOS');
    console.log('================================================\n');

    // Primeiro limpar o banco
    await clearDatabase();

    console.log('\n================================================');

    // Depois executar os seeds
    await runSeeds();

    console.log('\n================================================');
    console.log('🎯 RESET E SEED COMPLETO FINALIZADO!');
    console.log('================================================');
  } catch (error) {
    console.error('❌ Erro durante o reset e seed:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  resetAndSeed();
}
