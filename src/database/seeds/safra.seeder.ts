import { DataSource } from 'typeorm';
import { PropriedadeRural } from '../entities/propriedade-rural.entity';
import { Safra } from '../entities/safra.entity';

export class SafraSeeder {
  static async run(dataSource: DataSource): Promise<void> {
    const safraRepository = dataSource.getRepository(Safra);
    const propriedadeRepository = dataSource.getRepository(PropriedadeRural);

    console.log('📅 Iniciando seed de safras...');

    // Buscar todas as propriedades
    const propriedades = await propriedadeRepository.find();

    if (propriedades.length === 0) {
      console.log('❌ Nenhuma propriedade encontrada. Execute o seed de propriedades primeiro.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const safrasData = [
      { ano: currentYear, nome: `Safra ${currentYear}` },
      { ano: currentYear - 1, nome: `Safra ${currentYear - 1}` },
      { ano: currentYear - 2, nome: `Safra ${currentYear - 2}` },
    ];

    // Criar múltiplas safras para cada propriedade (relacionamento 1:N)
    for (const propriedade of propriedades) {
      for (const safraData of safrasData) {
        // Verificar se já existe uma safra com esse ano para essa propriedade
        const existingSafra = await safraRepository.findOne({
          where: {
            propriedadeRural: { id: propriedade.id },
            ano: safraData.ano,
          },
        });

        if (!existingSafra) {
          // Criar safra para a propriedade
          const safra = safraRepository.create({
            nome: `${safraData.nome} - ${propriedade.nomeFazenda}`,
            ano: safraData.ano,
            propriedadeRural: propriedade,
          });

          await safraRepository.save(safra);
          console.log(`   ✅ Safra "${safra.nome}" criada para ${propriedade.nomeFazenda}`);
        } else {
          console.log(`   ⚠️  Safra ${safraData.ano} já existe para "${propriedade.nomeFazenda}"`);
        }
      }
    }

    console.log('📅 Seed de safras concluído!\n');
  }
}
