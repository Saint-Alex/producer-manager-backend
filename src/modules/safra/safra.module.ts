import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Safra } from '../../database/entities/safra.entity';
import { SafraController } from './safra.controller';
import { SafraService } from './safra.service';

@Module({
  imports: [TypeOrmModule.forFeature([Safra])],
  controllers: [SafraController],
  providers: [SafraService],
  exports: [SafraService],
})
export class SafraModule {}
