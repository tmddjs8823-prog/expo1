import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'hongkildong' })
  @IsString()
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{3,19}$/, {
    message: '아이디는 영문으로 시작하고 영문/숫자/밑줄(_)로 4~20자여야 합니다.',
  })
  username: string;

  @ApiProperty({ example: '홍길동' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @ApiProperty({ example: 'user@expo.com' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(6, { message: '비밀번호는 6자 이상이어야 합니다.' })
  password: string;

  @ApiPropertyOptional({ example: '010-1234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '19900101' })
  @IsOptional()
  @IsString()
  birthdate?: string;
}
