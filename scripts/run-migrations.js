#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process');

const isProduction = process.env.NODE_ENV === 'production';

const command = isProduction
  ? 'npx typeorm migration:run -d dist/database/data-source.js'
  : 'ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/database/data-source.ts';

console.log('🚀 Executando migrations...');
console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`Comando: ${command}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  }

  if (stderr) {
    console.error('⚠️  Stderr:', stderr);
  }

  console.log('✅ Migrations executadas com sucesso!');
  console.log(stdout);
  process.exit(0);
});
