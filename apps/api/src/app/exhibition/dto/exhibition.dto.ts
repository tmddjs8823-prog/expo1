import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ExhibitionStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class CreateExhibitionDto {
  @ApiProperty({ description: '전시회 제목' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @ApiPropertyOptional({ description: '전시회 제목 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 제목은 문자열이어야 합니다.' })
  titleEn?: string;

  @ApiPropertyOptional({ description: '전시회 설명' })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiPropertyOptional({ description: '전시회 설명 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 설명은 문자열이어야 합니다.' })
  descriptionEn?: string;

  @ApiProperty({ description: '시작일 (ISO 8601)', example: '2025-01-01T09:00:00.000Z' })
  @IsDateString({}, { message: '올바른 시작일을 입력해주세요.' })
  startDate: string;

  @ApiProperty({ description: '종료일 (ISO 8601)', example: '2025-01-03T18:00:00.000Z' })
  @IsDateString({}, { message: '올바른 종료일을 입력해주세요.' })
  endDate: string;

  @ApiPropertyOptional({ description: '장소' })
  @IsOptional()
  @IsString({ message: '장소는 문자열이어야 합니다.' })
  venue?: string;

  @ApiPropertyOptional({ description: '전시회 이미지 URL' })
  @IsOptional()
  @IsString({ message: '이미지 URL은 문자열이어야 합니다.' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: '클릭 시 이동 링크' })
  @IsOptional()
  @IsString({ message: '링크 URL은 문자열이어야 합니다.' })
  linkUrl?: string;

  @ApiPropertyOptional({ description: '전시회 상태', enum: ExhibitionStatus, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(ExhibitionStatus, { message: '올바른 전시회 상태를 선택해주세요.' })
  status?: ExhibitionStatus;

  @ApiPropertyOptional({ description: '공개 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: '공개 여부는 참/거짓 값이어야 합니다.' })
  published?: boolean;
}

export class UpdateExhibitionDto extends PartialType(CreateExhibitionDto) {}

@Exclude()
export class ShopExhibitionResponseDto {
  @Expose() id: number;
  @Expose() title: string;
  @Expose() startDate: string;
  @Expose() endDate: string;
  @Expose() venue?: string;
  @Expose() imageUrl?: string;
  @Expose() status: string;
}

@Exclude()
export class AdminExhibitionListDto {
  @Expose() id: number;
  @Expose() title: string;
  @Expose() startDate: string;
  @Expose() endDate: string;
  @Expose() venue?: string;
  @Expose() status: string;
  @Expose() published: boolean;
}