import { SetMetadata } from '@nestjs/common';
import { Role } from '@app/auth/enum/roles.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
