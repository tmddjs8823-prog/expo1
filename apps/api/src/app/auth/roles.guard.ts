import {Injectable, CanActivate, ExecutionContext,ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor (private reflector:Reflector){}

    canActivate(context:ExecutionContext): boolean{
        const requiredRoles = this.reflector.get<string[]>
        (ROLES_KEY,context.getHandler());

        
        
        // @Roles 데코레이터가 지정이 안되어있으면 통과 (차후 조회용 api)
        if(!requiredRoles)
            return true;

        const {user} = context.switchToHttp().getRequest();

        // [user.role = ADMIN, requiredRoles = [ADMIN]] => true
        // [user.role = USER, requiredRoles = [ADMIN]] => false
        if 
        (!requiredRoles.includes(user.role)){
            throw new ForbiddenException('관리자만 접근 가능합니다.');
        }
        
        return true;
    }
}
