import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBannerDto {
  @ApiProperty({ description: '배너 제목' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @ApiPropertyOptional({ description: '부제목' })
  @IsOptional()
  @IsString({ message: '부제목은 문자열이어야 합니다.' })
  subtitle?: string;

  @ApiProperty({ description: '배너 이미지 URL' })
  @IsString({ message: '이미지 URL은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '배너 이미지를 등록해주세요.' })
  imageUrl: string;

  @ApiPropertyOptional({ description: '클릭 시 이동 링크' })
  @IsOptional()
  @IsString({ message: '링크 URL은 문자열이어야 합니다.' })
  linkUrl?: string;

  @ApiPropertyOptional({ description: '공개 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: '공개 여부는 참/거짓 값이어야 합니다.' })
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '정렬 순서는 정수여야 합니다.' })
  sortOrder?: number;

  @ApiPropertyOptional({ description: '전시회 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '전시회 ID는 정수여야 합니다.' })
  exhibitionId?: number;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
