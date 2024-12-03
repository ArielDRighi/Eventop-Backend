import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInAuthDto } from './dto/signIn.dto';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { sendWelcomeEmail } from '@app/config/nodeMailer';
import { MailService } from '@app/mail/mail.service';
import { Role } from './enum/roles.enum';
import { User } from '@app/users/entities/users.entity';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { assignPasswordDto } from './dto/assignPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signIn(credential: SignInAuthDto) {
    const dbUser = await this.userService.findOneByEmail(credential.email);
    if (!dbUser) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (dbUser.isBanned) {
      throw new BadRequestException(`Usuario baneado: ${dbUser.banReason}`);
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
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signInOauth(user: User) {
    const payload = {
      username: user.email,
      sub: user.userId,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signUp(user: CreateUserDto) {
    console.log(
      'Iniciando el proceso de registro para el usuario:',
      user.email,
    );

    // Revisamos que las contraseñas coincidan
    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Revisamos si el email ya existe en la DB
    const dbUser = await this.userService.findOneByEmail(user.email);
    if (dbUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = {
      ...user,
      password: hashedPassword,
    };

    // Creamos el nuevo usuario en la base de datos
    const createdUser = await this.userService.createUser(newUser);
    console.log('Usuario creado exitosamente:', createdUser.email);

    // Enviar el correo de bienvenida al usuario después de la creación
    try {
      console.log('Intentando enviar el correo de bienvenida a:', user.email);
      await sendWelcomeEmail(user.email, user.name); // Enviar correo de registro
      console.log('Correo de bienvenida enviado correctamente a:', user.email);
    } catch (error) {
      console.error('Error al enviar el correo de bienvenida:', error);
      throw new BadRequestException(
        'Hubo un problema al enviar el correo de bienvenida',
      );
    }

    // Devolvemos el usuario creado (sin la contraseña)
    return { ...createdUser, password: undefined };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findOneByEmail(googleUser.email);
    if (user) return user;
    return await this.userService.createUser(googleUser);
  }

  async changePassword(passwords: ChangePasswordDto, userId: number) {
    const user = await this.userService.findOneUser(userId);
    if (!user) {
      throw new BadRequestException(`User with id ${userId} not found`);
    }

    const isPasswordValid = await bcrypt.compare(
      passwords.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña invalida');
    }
    const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);
    return await this.userService.updatePassword(user.userId, hashedPassword);
  }

  async assignPassword(passwords: assignPasswordDto, userId: number) {
    const user = await this.userService.findOneUser(userId);
    if (!user) {
      throw new BadRequestException(`User with id ${userId} not found`);
    }
    const { password, confirmPassword } = passwords;
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.userService.updatePassword(user.userId, hashedPassword);
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    console.log(user);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const newPassword = Math.random().toString(36).slice(-8);
    console.log('Nueva contraseña generada:', newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.userId, hashedPassword);
    try {
      await this.mailService.sendForgotPasswordEmail(email, newPassword);
    } catch (error) {
      throw new BadRequestException('Error al enviar el correo');
    }
    return { message: 'Correo enviado' };
  }
}
