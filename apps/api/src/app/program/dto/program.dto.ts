import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProgramDto {
  @ApiProperty({ description: '프로그램 제목' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @ApiPropertyOptional({ description: '프로그램 제목 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 제목은 문자열이어야 합니다.' })
  titleEn?: string;

  @ApiPropertyOptional({ description: '프로그램 설명' })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiPropertyOptional({ description: '프로그램 설명 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 설명은 문자열이어야 합니다.' })
  descriptionEn?: string;

  @ApiPropertyOptional({ description: '발표자' })
  @IsOptional()
  @IsString({ message: '발표자는 문자열이어야 합니다.' })
  speaker?: string;

  @ApiPropertyOptional({ description: '발표자 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 발표자는 문자열이어야 합니다.' })
  speakerEn?: string;

  @ApiProperty({ description: '시작 시간 (ISO 8601)', example: '2025-01-01T10:00:00.000Z' })
  @IsDateString({}, { message: '올바른 시작 시간을 입력해주세요.' })
  startTime: string;

  @ApiProperty({ description: '종료 시간 (ISO 8601)', example: '2025-01-01T11:00:00.000Z' })
  @IsDateString({}, { message: '올바른 종료 시간을 입력해주세요.' })
  endTime: string;

  @ApiPropertyOptional({ description: '장소' })
  @IsOptional()
  @IsString({ message: '장소는 문자열이어야 합니다.' })
  location?: string;

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

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}