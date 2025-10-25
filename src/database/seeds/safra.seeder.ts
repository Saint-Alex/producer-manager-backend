import { DataSource } from 'typeorm';
import { Safra } from '../entities/safra.entity';

export class SafraSeeder {
  static async run(dataSource: DataSource): Promise<void> {
    const safraRepository = dataSource.getRepository(Safra);

    // Safras dos últimos 10 anos + próximos 3 anos
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 3;

    const anos: number[] = [];
    for (let year = startYear; year <= endYear; year++) {
      anos.push(year);
    }

    console.log('📅 Iniciando seed de safras...');

    for (const ano of anos) {
      // Verificar se a safra já existe
      const existingSafra = await safraRepository.findOne({
        where: { ano },
      });

      if (!existingSafra) {
        const safra = safraRepository.create({
          nome: `Safra ${ano}`,
          ano,
        });
        await safraRepository.save(safra);
        console.log(`   ✅ Safra ${ano} criada`);
      } else {
        console.log(`   ⚠️  Safra ${ano} já existe`);
      }
    }

    console.log('📅 Seed de safras concluído!\n');
  }
}
