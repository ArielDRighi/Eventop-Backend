import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from './enum/roles.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const userRoles = user.role;

    if (!userRoles) {
      throw new ForbiddenException('No tienes permitido acceder');
    }

    const hasRole = Array.isArray(userRoles)
      ? userRoles.some((role: Role) => requiredRoles.includes(role))
      : requiredRoles.includes(userRoles);

    if (!hasRole) {
      throw new ForbiddenException('No tienes permitido acceder');
    }

    return true;
  }
}
