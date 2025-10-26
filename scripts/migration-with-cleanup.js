#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');

const isProduction = process.env.NODE_ENV === 'production';

console.log('🔧 Preparando banco para migration problemática...');

// Primeiro, vamos limpar os dados das safras para permitir a migration
const command1 = isProduction
  ? 'npx typeorm query -d dist/database/data-source.js "DELETE FROM safras"'
  : 'npm run typeorm query -- -d src/database/data-source.ts "DELETE FROM safras"';

console.log('🗑️  Limpando dados das safras...');

exec(command1, (error, _stdout, _stderr) => {
  if (error) {
    console.error('❌ Erro ao limpar safras:', error);
    process.exit(1);
  }

  console.log('✅ Safras limpas com sucesso!');

  // Agora executar as migrations
  const command2 = isProduction
    ? 'npx typeorm migration:run -d dist/database/data-source.js'
    : 'ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/database/data-source.ts';

  console.log('🚀 Executando migrations...');

  exec(command2, (error2, stdout2, stderr2) => {
    if (error2) {
      console.error('❌ Erro ao executar migrations:', error2);
      process.exit(1);
    }

    if (stderr2) {
      console.error('⚠️  Stderr:', stderr2);
    }

    console.log('✅ Migrations executadas com sucesso!');
    console.log(stdout2);
    process.exit(0);
  });
});
