import { DataSource } from 'typeorm';
import { Produtor } from '../entities/produtor.entity';

export class ProdutorSeeder {
  static async run(dataSource: DataSource): Promise<void> {
    const produtorRepository = dataSource.getRepository(Produtor);

    const produtores = [
      {
        cpfCnpj: '12345678901',
        nome: 'João Silva',
      },
      {
        cpfCnpj: '98765432100',
        nome: 'Maria Santos',
      },
      {
        cpfCnpj: '11222333000181',
        nome: 'Fazenda Boa Vista LTDA',
      },
      {
        cpfCnpj: '55444333000122',
        nome: 'Agropecuária Três Irmãos LTDA',
      },
      {
        cpfCnpj: '45678912345',
        nome: 'Carlos Oliveira',
      },
      {
        cpfCnpj: '78912345678',
        nome: 'Ana Costa',
      },
      {
        cpfCnpj: '66777888000199',
        nome: 'Rural São Paulo LTDA',
      },
      {
        cpfCnpj: '32165498765',
        nome: 'Pedro Almeida',
      },
    ];

    console.log('👨‍🌾 Iniciando seed de produtores...');

    for (const produtorData of produtores) {
      // Verificar se o produtor já existe
      const existingProdutor = await produtorRepository.findOne({
        where: { cpfCnpj: produtorData.cpfCnpj },
      });

      if (!existingProdutor) {
        const produtor = produtorRepository.create(produtorData);
        await produtorRepository.save(produtor);
        console.log(`   ✅ Produtor "${produtorData.nome}" criado`);
      } else {
        console.log(`   ⚠️  Produtor "${produtorData.nome}" já existe`);
      }
    }

    console.log('👨‍🌾 Seed de produtores concluído!\n');
  }
}
