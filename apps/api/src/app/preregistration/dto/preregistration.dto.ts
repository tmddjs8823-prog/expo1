import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class PreregistrationDto {
  @ApiProperty({ description: '이름' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @ApiProperty({ description: '이메일', example: 'visitor@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiPropertyOptional({ description: '전화번호' })
  @IsOptional()
  @IsPhoneNumber('KR', { message: '올바른 전화번호 형식을 입력해주세요.' })
  phone?: string;

  @ApiPropertyOptional({ description: '회사명' })
  @IsOptional()
  @IsString({ message: '회사명은 문자열이어야 합니다.' })
  company?: string;

  @ApiPropertyOptional({ description: '직책' })
  @IsOptional()
  @IsString({ message: '직책은 문자열이어야 합니다.' })
  jobTitle?: string;

  @ApiProperty({ description: '이용약관 동의 여부' })
  @IsBoolean({ message: '이용약관 동의 여부를 선택해주세요.' })
  agreeTerms: boolean;

  @ApiPropertyOptional({ description: '마케팅 수신 동의 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: '마케팅 수신 동의 여부는 참/거짓 값이어야 합니다.' })
  agreeMarketing?: boolean;

  @ApiPropertyOptional({ description: '전시회 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '전시회를 선택해주세요.' })
  exhibitionId?: number;
}

@Exclude()
export class AdminPreregExhibitionDto {
  @Expose() id: number;
  @Expose() title: string;
}

@Exclude()
export class AdminPreregListDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() email: string;
  @Expose() phone?: string;
  @Expose() company?: string;
  @Expose() jobTitle?: string;
  @Expose() @Type(() => AdminPreregExhibitionDto) exhibition?: AdminPreregExhibitionDto;
}
