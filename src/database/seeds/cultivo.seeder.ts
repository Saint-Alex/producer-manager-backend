import { DataSource } from 'typeorm';
import { Cultivo } from '../entities/cultivo.entity';
import { Cultura } from '../entities/cultura.entity';
import { PropriedadeRural } from '../entities/propriedade-rural.entity';
import { Safra } from '../entities/safra.entity';

export class CultivoSeeder {
  static async run(dataSource: DataSource): Promise<void> {
    const cultivoRepository = dataSource.getRepository(Cultivo);
    const propriedadeRepository = dataSource.getRepository(PropriedadeRural);
    const culturaRepository = dataSource.getRepository(Cultura);
    const safraRepository = dataSource.getRepository(Safra);

    // Buscar todas as entidades necessárias
    const propriedades = await propriedadeRepository.find();
    const culturas = await culturaRepository.find();
    const safras = await safraRepository.find({ relations: ['propriedadeRural'] });

    if (propriedades.length === 0) {
      console.log('❌ Nenhuma propriedade encontrada. Execute o seed de propriedades primeiro.');
      return;
    }

    if (culturas.length === 0) {
      console.log('❌ Nenhuma cultura encontrada. Execute o seed de culturas primeiro.');
      return;
    }

    if (safras.length === 0) {
      console.log('❌ Nenhuma safra encontrada. Execute o seed de safras primeiro.');
      return;
    }

    // Configurar cultivos por propriedade
    const cultivosData = [
      // Fazenda Boa Esperança - Ribeirão Preto/SP (foco em cana-de-açúcar e milho)
      {
        propriedadeNome: 'Fazenda Boa Esperança',
        culturaNome: 'Cana-de-açúcar',
        areaPlantada: 600.0,
      },
      {
        propriedadeNome: 'Fazenda Boa Esperança',
        culturaNome: 'Milho',
        areaPlantada: 200.3,
      },

      // Sítio da Cachoeira - Uberlândia/MG (pequena propriedade diversificada)
      {
        propriedadeNome: 'Sítio da Cachoeira',
        culturaNome: 'Café',
        areaPlantada: 180.5,
      },
      {
        propriedadeNome: 'Sítio da Cachoeira',
        culturaNome: 'Feijão',
        areaPlantada: 120.0,
      },

      // Fazenda Santa Maria - Campo Grande/MS (soja e milho)
      {
        propriedadeNome: 'Fazenda Santa Maria',
        culturaNome: 'Soja',
        areaPlantada: 1200.0,
      },
      {
        propriedadeNome: 'Fazenda Santa Maria',
        culturaNome: 'Milho',
        areaPlantada: 600.0,
      },

      // Estância Água Limpa - Cuiabá/MT (grande propriedade com soja, milho e algodão)
      {
        propriedadeNome: 'Estância Água Limpa',
        culturaNome: 'Soja',
        areaPlantada: 2000.0,
      },
      {
        propriedadeNome: 'Estância Água Limpa',
        culturaNome: 'Milho',
        areaPlantada: 1000.0,
      },
      {
        propriedadeNome: 'Estância Água Limpa',
        culturaNome: 'Algodão',

        areaPlantada: 500.75,
      },

      // Fazenda Rio Verde - Rio Verde/GO (soja e milho - região típica do cerrado)
      {
        propriedadeNome: 'Fazenda Rio Verde',
        culturaNome: 'Soja',

        areaPlantada: 1500.0,
      },
      {
        propriedadeNome: 'Fazenda Rio Verde',
        culturaNome: 'Milho',

        areaPlantada: 900.6,
      },

      // Chácara Três Palmeiras - Barretos/SP (pequena propriedade com café e frutas)
      {
        propriedadeNome: 'Chácara Três Palmeiras',
        culturaNome: 'Café',

        areaPlantada: 80.0,
      },
      {
        propriedadeNome: 'Chácara Três Palmeiras',
        culturaNome: 'Laranja',

        areaPlantada: 40.2,
      },

      // Fazenda Cerrado Azul - Brasília/DF (milho e soja)
      {
        propriedadeNome: 'Fazenda Cerrado Azul',
        culturaNome: 'Soja',

        areaPlantada: 800.0,
      },
      {
        propriedadeNome: 'Fazenda Cerrado Azul',
        culturaNome: 'Milho',

        areaPlantada: 500.0,
      },

      // Sítio do Ipê - Londrina/PR (soja, milho e trigo)
      {
        propriedadeNome: 'Sítio do Ipê',
        culturaNome: 'Soja',

        areaPlantada: 300.0,
      },
      {
        propriedadeNome: 'Sítio do Ipê',
        culturaNome: 'Milho',

        areaPlantada: 180.3,
      },

      // Fazenda Vale do Sol - Passo Fundo/RS (soja, milho e trigo)
      {
        propriedadeNome: 'Fazenda Vale do Sol',
        culturaNome: 'Soja',

        areaPlantada: 1000.0,
      },
      {
        propriedadeNome: 'Fazenda Vale do Sol',
        culturaNome: 'Milho',

        areaPlantada: 650.7,
      },

      // Estância Beira Rio - São Luís/MA (arroz e soja)
      {
        propriedadeNome: 'Estância Beira Rio',
        culturaNome: 'Arroz',

        areaPlantada: 1500.0,
      },
      {
        propriedadeNome: 'Estância Beira Rio',
        culturaNome: 'Soja',

        areaPlantada: 1350.45,
      },

      // Chácara Monte Alto - Campinas/SP (café e cana)
      {
        propriedadeNome: 'Chácara Monte Alto',
        culturaNome: 'Café',

        areaPlantada: 150.0,
      },
      {
        propriedadeNome: 'Chácara Monte Alto',
        culturaNome: 'Cana-de-açúcar',

        areaPlantada: 90.6,
      },

      // Fazenda Nova Era - Dourados/MS (soja, milho e algodão)
      {
        propriedadeNome: 'Fazenda Nova Era',
        culturaNome: 'Soja',

        areaPlantada: 2000.0,
      },
      {
        propriedadeNome: 'Fazenda Nova Era',
        culturaNome: 'Milho',

        areaPlantada: 1000.0,
      },
      {
        propriedadeNome: 'Fazenda Nova Era',
        culturaNome: 'Algodão',

        areaPlantada: 375.23,
      },

      // Alguns cultivos de safras anteriores para histórico
      {
        propriedadeNome: 'Fazenda Santa Maria',
        culturaNome: 'Soja',

        areaPlantada: 1100.0,
      },
      {
        propriedadeNome: 'Estância Água Limpa',
        culturaNome: 'Soja',

        areaPlantada: 1800.0,
      },
      {
        propriedadeNome: 'Fazenda Rio Verde',
        culturaNome: 'Milho',

        areaPlantada: 800.0,
      },
    ];

    console.log('🌱 Iniciando seed de cultivos...');

    for (const cultivoData of cultivosData) {
      // Buscar a propriedade
      const propriedade = await propriedadeRepository.findOne({
        where: { nomeFazenda: cultivoData.propriedadeNome },
      });

      if (!propriedade) {
        console.log(`   ❌ Propriedade "${cultivoData.propriedadeNome}" não encontrada`);
        continue;
      }

      // Buscar a cultura
      const cultura = await culturaRepository.findOne({
        where: { nome: cultivoData.culturaNome },
      });

      if (!cultura) {
        console.log(`   ❌ Cultura "${cultivoData.culturaNome}" não encontrada`);
        continue;
      }

      // Buscar a safra específica da propriedade
      const safra = safras.find(
        (s) => s.propriedadeRural && s.propriedadeRural.id === propriedade.id,
      );

      if (!safra) {
        console.log(`   ❌ Safra não encontrada para a propriedade "${propriedade.nomeFazenda}"`);
        continue;
      }

      // Verificar se o cultivo já existe
      const existingCultivo = await cultivoRepository.findOne({
        where: {
          propriedadeRural: { id: propriedade.id },
          cultura: { id: cultura.id },
          safra: { id: safra.id },
        },
      });

      if (!existingCultivo) {
        const cultivo = cultivoRepository.create({
          areaPlantada: cultivoData.areaPlantada,
          propriedadeRural: propriedade,
          cultura: cultura,
          safra: safra,
        });

        await cultivoRepository.save(cultivo);
        console.log(
          `   ✅ Cultivo de ${cultura.nome} na ${propriedade.nomeFazenda} (${safra.ano}) criado - ${cultivoData.areaPlantada}ha`,
        );
      } else {
        console.log(
          `   ⚠️  Cultivo de ${cultura.nome} na ${propriedade.nomeFazenda} (${safra.ano}) já existe`,
        );
      }
    }

    console.log('🌱 Seed de cultivos concluído!\n');
  }
}
