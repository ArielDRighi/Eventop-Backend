import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInAuthDto } from './dto/signIn.dto';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(credential: SignInAuthDto) {
    const dbUser = await this.userService.findOneByEmail(credential.email);
    if (!dbUser) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const isPasswordValid = await bcrypt.compare(
      credential.password,
      dbUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña invalida');
    }
    const payload = {
      username: dbUser.email,
      sub: dbUser.userId,
      role: dbUser.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(user: CreateUserDto) {
    // Revisamos que las contraseñas coincidan
    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    // Revisamos si el email ya existe en la DB
    const dbUser = await this.userService.findOneByEmail(user.email);
    if (dbUser) {
      throw new BadRequestException('El email ya está registrado');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = {
      ...user,
      password: hashedPassword,
    };
    return await this.userService.createUser(newUser);
  }
}
