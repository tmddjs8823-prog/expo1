import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

/**
 * @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(...) 를 하나로 합친 커스텀 데코레이터
 *
 * @example
 * // 메서드 레벨
 * @Auth('ADMIN')
 *
 * // 컨트롤러 레벨 (역할 체크 없이 인증만)
 * @Auth()
 */
export function Auth(...roles: string[]) {
    const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
        UseGuards(JwtAuthGuard, RolesGuard),
    ];

    if (roles.length > 0) {
        decorators.push(Roles(...roles));
    }

    return applyDecorators(...decorators);
}
