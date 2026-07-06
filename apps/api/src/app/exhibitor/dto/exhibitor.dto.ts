import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class CreateExhibitorDto {
  @ApiProperty({ description: '업체명' })
  @IsString({ message: '업체명은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '업체명을 입력해주세요.' })
  companyName: string;

  @ApiPropertyOptional({ description: '업체명 (EN)' })
  @IsOptional()
  @IsString({ message: '영문 업체명은 문자열이어야 합니다.' })
  companyNameEn?: string;

  @ApiPropertyOptional({ description: '업체 설명' })
  @IsOptional()
  @IsString({ message: '업체 설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiPropertyOptional({ description: '부스 번호' })
  @IsOptional()
  @IsString({ message: '부스 번호는 문자열이어야 합니다.' })
  boothNumber?: string;

  @ApiPropertyOptional({ description: '담당자 이메일', example: 'contact@company.com' })
  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  contactEmail?: string;

  @ApiPropertyOptional({ description: '담당자 전화번호' })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  contactPhone?: string;

  @ApiPropertyOptional({ description: '웹사이트 URL' })
  @IsOptional()
  @IsString({ message: '웹사이트 URL은 문자열이어야 합니다.' })
  website?: string;

  @ApiProperty({ description: '소속 전시회 ID' })
  @Type(() => Number)
  @IsInt({ message: '전시회를 선택해주세요.' })
  exhibitionId: number;
}

export class UpdateExhibitorDto extends PartialType(CreateExhibitorDto) {}

@Exclude()
export class AdminExhibitorExhibitionDto {
  @Expose() id: number;
  @Expose() title: string;
}

@Exclude()
export class AdminExhibitorListDto {
  @Expose() id: number;
  @Expose() companyName: string;
  @Expose() boothNumber?: string;
  @Expose() contactEmail?: string;
  @Expose() exhibitionId: number;
  @Expose() @Type(() => AdminExhibitorExhibitionDto) exhibition?: AdminExhibitorExhibitionDto;
}
