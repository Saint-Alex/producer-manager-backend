import { DataSource } from 'typeorm';
import { Cultura } from '../entities/cultura.entity';

export class CulturaSeeder {
  static async run(dataSource: DataSource): Promise<void> {
    const culturaRepository = dataSource.getRepository(Cultura);

    // Culturas mais comuns no Brasil conforme dados do IBGE
    const culturas = [
      'Soja',
      'Milho',
      'Café',
      'Cana-de-açúcar',
      'Algodão',
      'Arroz',
      'Feijão',
      'Trigo',
      'Mandioca',
      'Sorgo',
      'Aveia',
      'Cevada',
      'Girassol',
      'Amendoim',
      'Mamona',
      'Banana',
      'Laranja',
      'Maçã',
      'Uva',
      'Coco',
      'Cacau',
      'Eucalipto',
      'Pinus',
    ];

    console.log('🌱 Iniciando seed de culturas...');

    for (const nome of culturas) {
      // Verificar se a cultura já existe
      const existingCultura = await culturaRepository.findOne({
        where: { nome },
      });

      if (!existingCultura) {
        const cultura = culturaRepository.create({ nome });
        await culturaRepository.save(cultura);
        console.log(`   ✅ Cultura "${nome}" criada`);
      } else {
        console.log(`   ⚠️  Cultura "${nome}" já existe`);
      }
    }

    console.log('🌱 Seed de culturas concluído!\n');
  }
}
