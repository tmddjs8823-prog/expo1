import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGalleryDto {
  @ApiProperty({ description: '갤러리 제목' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @ApiPropertyOptional({ description: '갤러리 제목 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 제목은 문자열이어야 합니다.' })
  titleEn?: string;

  @ApiPropertyOptional({ description: '갤러리 설명' })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiProperty({ description: '이미지 URL' })
  @IsString({ message: '이미지 URL은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이미지를 등록해주세요.' })
  imageUrl: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsOptional()
  @IsString({ message: '썸네일 URL은 문자열이어야 합니다.' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '공개 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: '공개 여부는 참/거짓 값이어야 합니다.' })
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '정렬 순서는 정수여야 합니다.' })
  sortOrder?: number;
}

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {}
