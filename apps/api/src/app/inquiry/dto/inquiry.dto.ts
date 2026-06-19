import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({ description: '문의자 이름' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @ApiProperty({ description: '문의자 이메일', example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiPropertyOptional({ description: '문의자 전화번호' })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  phone?: string;

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
