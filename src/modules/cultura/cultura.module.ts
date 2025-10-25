import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cultura } from '../../database/entities/cultura.entity';
import { CulturaController } from './cultura.controller';
import { CulturaService } from './cultura.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cultura])],
  controllers: [CulturaController],
  providers: [CulturaService],
  exports: [CulturaService],
})
export class CulturaModule {}
