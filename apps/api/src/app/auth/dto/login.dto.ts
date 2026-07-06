import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString({ message: '아이디를 입력해주세요.' })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;
}
