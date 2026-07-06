import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class CreateNoticeDto {
  @ApiProperty({ description: '공지사항 제목' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @ApiProperty({ description: '공지사항 내용' })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content: string;

  @ApiPropertyOptional({ description: '공개 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: '공개 여부는 참/거짓 값이어야 합니다.' })
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '정렬 순서는 정수여야 합니다.' })
  sortOrder?: number;

  @ApiPropertyOptional({ description: '상단 고정', default: false })
  @IsOptional()
  @IsBoolean({ message: '상단 고정은 참/거짓 값이어야 합니다.' })
  isPinned?: boolean;
}

export class UpdateNoticeDto extends PartialType(CreateNoticeDto) {}

@Exclude()
export class ShopNoticeResponseDto {
  @Expose() id: number;
  @Expose() title: string;
  @Expose() isPinned: boolean;
  @Expose() createdAt: string;
}

@Exclude()
export class AdminNoticeListDto {
  @Expose() id: number;
  @Expose() title: string;
  @Expose() published: boolean;
  @Expose() isPinned: boolean;
  @Expose() createdAt: string;
}

@Exclude()
export class ShopNoticeDetailDto {
  @Expose() id: number;
  @Expose() title: string;
  @Expose() content: string;
  @Expose() createdAt: string;
}