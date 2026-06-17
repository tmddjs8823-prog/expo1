import { Module } from '@nestjs/common';
import { PreregistrationController } from './preregistration.controller';
import { PreregistrationService } from './preregistration.service';

@Module({
  controllers: [PreregistrationController],
  providers: [PreregistrationService],
})
export class PreregistrationModule {}
