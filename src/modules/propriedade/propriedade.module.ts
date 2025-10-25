import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { PropriedadeController } from './propriedade.controller';
import { PropriedadeService } from './propriedade.service';

@Module({
  imports: [TypeOrmModule.forFeature([PropriedadeRural, Produtor])],
  controllers: [PropriedadeController],
  providers: [PropriedadeService],
  exports: [PropriedadeService],
})
export class PropriedadeModule {}
