import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NoticeModule } from './notice/notice.module';
import { FaqModule } from './faq/faq.module';
import { ExhibitionModule } from './exhibition/exhibition.module';
import { ProgramModule } from './program/program.module';
import { GalleryModule } from './gallery/gallery.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { PreregistrationModule } from './preregistration/preregistration.module';
import { ExhibitorModule } from './exhibitor/exhibitor.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    NoticeModule,
    FaqModule,
    ExhibitionModule,
    ProgramModule,
    GalleryModule,
    InquiryModule,
    PreregistrationModule,
    ExhibitorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
