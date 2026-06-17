import { Module } from '@nestjs/common';
import { ExhibitorController } from './exhibitor.controller';
import { ExhibitorService } from './exhibitor.service';

@Module({
  controllers: [ExhibitorController],
  providers: [ExhibitorService],
})
export class ExhibitorModule {}
