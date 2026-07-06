import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class CreateInquiryDto {
  @ApiPropertyOptional({ description: '문의자 이름 (로그인 시 자동)' })
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  name?: string;

  @ApiPropertyOptional({ description: '문의자 이메일 (로그인 시 자동)' })
  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email?: string;

  @ApiProperty({ description: '문의 제목' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  subject: string;

  @ApiProperty({ description: '문의 내용' })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content: string;
}

export class AnswerInquiryDto {
  @ApiProperty({ description: '답변 내용' })
  @IsString({ message: '답변은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '답변 내용을 입력해주세요.' })
  answer: string;
}

@Exclude()
export class MyInquiryResponseDto {
  @Expose() id: number;
  @Expose() subject: string;
  @Expose() content: string;
  @Expose() answer?: string;
  @Expose() answeredAt?: string;
  @Expose() createdAt: string;
}

@Exclude()
export class AdminInquiryUserDto {
  @Expose() id: number;
  @Expose() username: string;
  @Expose() name: string;
}

@Exclude()
export class AdminInquiryListDto {
  @Expose() id: number;
  @Expose() subject: string;
  @Expose() status: string;
  @Expose() createdAt: string;
  @Expose() @Type(() => AdminInquiryUserDto) user?: AdminInquiryUserDto;
}
