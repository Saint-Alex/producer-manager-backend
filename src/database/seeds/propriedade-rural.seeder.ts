import { DataSource } from 'typeorm';
import { Produtor } from '../entities/produtor.entity';
import { PropriedadeRural } from '../entities/propriedade-rural.entity';

export class PropriedadeRuralSeeder {
  static async run(dataSource: DataSource): Promise<void> {
    const propriedadeRepository = dataSource.getRepository(PropriedadeRural);
    const produtorRepository = dataSource.getRepository(Produtor);

    // Buscar todos os produtores para associar às propriedades
    const produtores = await produtorRepository.find();

    if (produtores.length === 0) {
      console.log('❌ Nenhum produtor encontrado. Execute o seed de produtores primeiro.');
      return;
    }

    const propriedades = [
      {
        nomeFazenda: 'Fazenda Boa Esperança',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 1200.5,
        areaAgricultavel: 800.3,
        areaVegetacao: 400.2,
        produtorCpfCnpj: '12345678901',
      },
      {
        nomeFazenda: 'Sítio da Cachoeira',
        cidade: 'Uberlândia',
        estado: 'MG',
        areaTotal: 450.75,
        areaAgricultavel: 300.5,
        areaVegetacao: 150.25,
        produtorCpfCnpj: '12345678901',
      },
      {
        nomeFazenda: 'Fazenda Santa Maria',
        cidade: 'Campo Grande',
        estado: 'MS',
        areaTotal: 2500.0,
        areaAgricultavel: 1800.0,
        areaVegetacao: 700.0,
        produtorCpfCnpj: '98765432100',
      },
      {
        nomeFazenda: 'Estância Água Limpa',
        cidade: 'Cuiabá',
        estado: 'MT',
        areaTotal: 5000.25,
        areaAgricultavel: 3500.75,
        areaVegetacao: 1499.5,
        produtorCpfCnpj: '11222333000181',
      },
      {
        nomeFazenda: 'Fazenda Rio Verde',
        cidade: 'Rio Verde',
        estado: 'GO',
        areaTotal: 3200.8,
        areaAgricultavel: 2400.6,
        areaVegetacao: 800.2,
        produtorCpfCnpj: '11222333000181',
      },
      {
        nomeFazenda: 'Chácara Três Palmeiras',
        cidade: 'Barretos',
        estado: 'SP',
        areaTotal: 180.3,
        areaAgricultavel: 120.2,
        areaVegetacao: 60.1,
        produtorCpfCnpj: '55444333000122',
      },
      {
        nomeFazenda: 'Fazenda Cerrado Azul',
        cidade: 'Brasília',
        estado: 'DF',
        areaTotal: 1800.0,
        areaAgricultavel: 1300.0,
        areaVegetacao: 500.0,
        produtorCpfCnpj: '45678912345',
      },
      {
        nomeFazenda: 'Sítio do Ipê',
        cidade: 'Londrina',
        estado: 'PR',
        areaTotal: 650.4,
        areaAgricultavel: 480.3,
        areaVegetacao: 170.1,
        produtorCpfCnpj: '45678912345',
      },
      {
        nomeFazenda: 'Fazenda Vale do Sol',
        cidade: 'Passo Fundo',
        estado: 'RS',
        areaTotal: 2200.9,
        areaAgricultavel: 1650.7,
        areaVegetacao: 550.2,
        produtorCpfCnpj: '78912345678',
      },
      {
        nomeFazenda: 'Estância Beira Rio',
        cidade: 'São Luís',
        estado: 'MA',
        areaTotal: 3800.6,
        areaAgricultavel: 2850.45,
        areaVegetacao: 950.15,
        produtorCpfCnpj: '66777888000199',
      },
      {
        nomeFazenda: 'Chácara Monte Alto',
        cidade: 'Campinas',
        estado: 'SP',
        areaTotal: 320.8,
        areaAgricultavel: 240.6,
        areaVegetacao: 80.2,
        produtorCpfCnpj: '32165498765',
      },
      {
        nomeFazenda: 'Fazenda Nova Era',
        cidade: 'Dourados',
        estado: 'MS',
        areaTotal: 4500.3,
        areaAgricultavel: 3375.23,
        areaVegetacao: 1125.07,
        produtorCpfCnpj: '32165498765',
      },
    ];

    console.log('🏡 Iniciando seed de propriedades rurais...');

    for (const propriedadeData of propriedades) {
      // Buscar o produtor para associar
      const produtor = await produtorRepository.findOne({
        where: { cpfCnpj: propriedadeData.produtorCpfCnpj },
      });

      if (!produtor) {
        console.log(
          `   ❌ Produtor ${propriedadeData.produtorCpfCnpj} não encontrado para a propriedade ${propriedadeData.nomeFazenda}`,
        );
        continue;
      }

      // Verificar se a propriedade já existe
      const existingPropriedade = await propriedadeRepository.findOne({
        where: {
          nomeFazenda: propriedadeData.nomeFazenda,
          cidade: propriedadeData.cidade,
          estado: propriedadeData.estado,
        },
      });

      if (!existingPropriedade) {
        // Criar a propriedade sem o campo produtorCpfCnpj
        const { produtorCpfCnpj, ...propriedadeWithoutProdutor } = propriedadeData;
        const propriedade = propriedadeRepository.create(propriedadeWithoutProdutor);

        // Associar o produtor
        propriedade.produtores = [produtor];

        await propriedadeRepository.save(propriedade);
        console.log(
          `   ✅ Propriedade "${propriedadeData.nomeFazenda}" criada e associada ao produtor ${produtor.nome}`,
        );
      } else {
        console.log(`   ⚠️  Propriedade "${propriedadeData.nomeFazenda}" já existe`);
      }
    }

    console.log('🏡 Seed de propriedades rurais concluído!\n');
  }
}
