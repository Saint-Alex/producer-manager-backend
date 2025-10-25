import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../database/entities/cultivo.entity';
import { Produtor } from '../database/entities/produtor.entity';
import { PropriedadeRural } from '../database/entities/propriedade-rural.entity';

export interface DashboardStats {
  totalFazendas: number;
  totalAreaHectares: number;
  totalProdutores: number;
  areaPorEstado: Array<{
    estado: string;
    area: number;
    fazendas: number;
  }>;
  areaPorCultura: Array<{
    cultura: string;
    area: number;
    percentual: number;
  }>;
  usoSolo: {
    areaAgricultavel: number;
    areaVegetacao: number;
    percentualAgricultavel: number;
    percentualVegetacao: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Produtor)
    private readonly produtorRepository: Repository<Produtor>,
    @InjectRepository(PropriedadeRural)
    private readonly propriedadeRepository: Repository<PropriedadeRural>,
    @InjectRepository(Cultivo)
    private readonly cultivoRepository: Repository<Cultivo>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [
      totalProdutores,
      propriedadesStats,
      areaPorEstado,
      areaPorCultura,
      usoSolo
    ] = await Promise.all([
      this.getTotalProdutores(),
      this.getPropriedadesStats(),
      this.getAreaPorEstado(),
      this.getAreaPorCultura(),
      this.getUsoSolo()
    ]);

    return {
      totalProdutores,
      totalFazendas: propriedadesStats.total,
      totalAreaHectares: propriedadesStats.areaTotal,
      areaPorEstado,
      areaPorCultura,
      usoSolo
    };
  }

  private async getTotalProdutores(): Promise<number> {
    return await this.produtorRepository.count();
  }

  private async getPropriedadesStats(): Promise<{ total: number; areaTotal: number }> {
    const result = await this.propriedadeRepository
      .createQueryBuilder('propriedade')
      .select('COUNT(*)', 'total')
      .addSelect('COALESCE(SUM(propriedade.area_total), 0)', 'areaTotal')
      .getRawOne();

    return {
      total: parseInt(result.total),
      areaTotal: parseFloat(result.areatotal) || 0
    };
  }

  private async getAreaPorEstado(): Promise<Array<{
    estado: string;
    area: number;
    fazendas: number;
  }>> {
    const result = await this.propriedadeRepository
      .createQueryBuilder('propriedade')
      .select('propriedade.estado', 'estado')
      .addSelect('COUNT(*)', 'fazendas')
      .addSelect('COALESCE(SUM(propriedade.area_total), 0)', 'area')
      .groupBy('propriedade.estado')
      .orderBy('area', 'DESC')
      .getRawMany();

    return result.map(item => ({
      estado: item.estado,
      fazendas: parseInt(item.fazendas),
      area: parseFloat(item.area) || 0
    }));
  }

  private async getAreaPorCultura(): Promise<Array<{
    cultura: string;
    area: number;
    percentual: number;
  }>> {
    const result = await this.cultivoRepository
      .createQueryBuilder('cultivo')
      .innerJoin('cultivo.cultura', 'cultura')
      .select('cultura.nome', 'cultura')
      .addSelect('COALESCE(SUM(cultivo.area_plantada), 0)', 'area')
      .groupBy('cultura.nome')
      .orderBy('area', 'DESC')
      .getRawMany();

    const totalArea = result.reduce((acc, item) => acc + (parseFloat(item.area) || 0), 0);

    return result.map(item => {
      const area = parseFloat(item.area) || 0;
      return {
        cultura: item.cultura,
        area,
        percentual: totalArea > 0 ? (area / totalArea) * 100 : 0
      };
    });
  }

  private async getUsoSolo(): Promise<{
    areaAgricultavel: number;
    areaVegetacao: number;
    percentualAgricultavel: number;
    percentualVegetacao: number;
  }> {
    const result = await this.propriedadeRepository
      .createQueryBuilder('propriedade')
      .select('COALESCE(SUM(propriedade.area_agricultavel), 0)', 'areaAgricultavel')
      .addSelect('COALESCE(SUM(propriedade.area_vegetacao), 0)', 'areaVegetacao')
      .addSelect('COALESCE(SUM(propriedade.area_total), 0)', 'areaTotal')
      .getRawOne();

    const areaAgricultavel = parseFloat(result.areaagricultavel) || 0;
    const areaVegetacao = parseFloat(result.areavegetacao) || 0;
    const areaTotal = parseFloat(result.areatotal) || 0;

    return {
      areaAgricultavel,
      areaVegetacao,
      percentualAgricultavel: areaTotal > 0 ? (areaAgricultavel / areaTotal) * 100 : 0,
      percentualVegetacao: areaTotal > 0 ? (areaVegetacao / areaTotal) * 100 : 0
    };
  }
}
