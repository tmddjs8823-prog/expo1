import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// FaqCategory
export class CreateFaqCategoryDto {
  @ApiProperty({ description: 'FAQ 카테고리명' })
  @IsString({ message: '카테고리명은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '카테고리명을 입력해주세요.' })
  name: string;

  @ApiPropertyOptional({ description: '정렬 순서', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '정렬 순서는 정수여야 합니다.' })
  sortOrder?: number;
}

export class UpdateFaqCategoryDto extends PartialType(CreateFaqCategoryDto) {}

// Faq
export class CreateFaqDto {
  @ApiProperty({ description: '질문' })
  @IsString({ message: '질문은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '질문을 입력해주세요.' })
  question: string;

  @ApiPropertyOptional({ description: '질문 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 질문은 문자열이어야 합니다.' })
  questionEn?: string;

  @ApiProperty({ description: '답변' })
  @IsString({ message: '답변은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '답변을 입력해주세요.' })
  answer: string;

  @ApiPropertyOptional({ description: '답변 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 답변은 문자열이어야 합니다.' })
  answerEn?: string;

  @ApiPropertyOptional({ description: '공개 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: '공개 여부는 참/거짓 값이어야 합니다.' })
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '정렬 순서는 정수여야 합니다.' })
  sortOrder?: number;

  @ApiProperty({ description: 'FAQ 카테고리 ID' })
  @Type(() => Number)
  @IsInt({ message: '카테고리를 선택해주세요.' })
  categoryId: number;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
