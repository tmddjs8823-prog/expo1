import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
}

export class UpdateNoticeDto extends PartialType(CreateNoticeDto) {}