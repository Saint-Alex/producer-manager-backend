import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Cultura } from '../../database/entities/cultura.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { CultivoController } from './cultivo.controller';
import { CultivoService } from './cultivo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cultivo, PropriedadeRural, Cultura, Safra])],
  controllers: [CultivoController],
  providers: [CultivoService],
  exports: [CultivoService],
})
export class CultivoModule {}
