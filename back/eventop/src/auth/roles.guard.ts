import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
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
      throw new ForbiddenException('You do not have permission to access');
    }

    const userRoles = user.role;

    if (!userRoles) {
      throw new ForbiddenException('You are not allowed to access');
    }

    const hasRole = Array.isArray(userRoles)
      ? userRoles.some((role: Role) => requiredRoles.includes(role))
      : requiredRoles.includes(userRoles);

    if (!hasRole) {
      throw new ForbiddenException('You are not allowed to access');
    }

    return true;
  }
}
