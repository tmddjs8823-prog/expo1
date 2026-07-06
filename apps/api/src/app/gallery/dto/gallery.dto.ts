import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';


export class CreateGalleryDto {
  @ApiProperty({ description: '갤러리 제목' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;



  @ApiPropertyOptional({ description: '갤러리 설명' })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiProperty({ description: '이미지 URL' })
  @IsString({ message: '이미지 URL은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이미지를 등록해주세요.' })
  imageUrl: string;


  @ApiPropertyOptional({ description: '시설 카테고리 (예: 전시홀, 회의실, 식음시설, 지원시설)' })
  @IsOptional()
  @IsString({ message: '카테고리는 문자열이어야 합니다.' })
  category?: string;

  @ApiPropertyOptional({ description: '공개 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: '공개 여부는 참/거짓 값이어야 합니다.' })
  published?: boolean;




  @ApiPropertyOptional({ description: '전시회 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '전시회 ID는 정수여야 합니다.' })
  exhibitionId?: number;
}

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {}

@Exclude()
export class ShopGalleryResponseDto {
  @Expose() id: number;
  @Expose() title: string;

  @Expose() description?: string;
  @Expose() imageUrl: string;
  @Expose() category?: string;
}

@Exclude()
export class AdminGalleryExhibitionDto {
  @Expose() id: number;
  @Expose() title: string;
}

@Exclude()
export class AdminGalleryListDto {
  @Expose() id: number;
  @Expose() title: string;
  @Expose() imageUrl: string;
  @Expose() category?: string;
  @Expose() published: boolean;
  @Expose() createdAt: string;
  @Expose() @Type(() => AdminGalleryExhibitionDto) exhibition?: AdminGalleryExhibitionDto;
}

