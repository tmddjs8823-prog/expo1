import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { BannerModule } from './banner/banner.module';
import { SearchModule } from './search/search.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    BannerModule,
    SearchModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} // search module registered
