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
      access_token: this.jwtService.sign(payload),
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

  async handleAuth0Callback(auth0User: any) {
    const { email, name } = auth0User;
    console.log('Auth0 User:', auth0User);

    let user = await this.userService.findOneByEmail(email);
    console.log('User found in DB:', user);

    if (!user) {
      console.log('User not found, creating a new user');
      // Crear un nuevo usuario con el rol necesario
      const password = Math.random().toString(36).substring(7);
      const hashedPassword = await bcrypt.hash(password, 10);
      const createUserDto: CreateUserDto = {
        email,
        name,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        role: Role.User,
      };
      console.log('CreateUserDto:', createUserDto);

      await this.mailService.sendPassword(email, password);
      console.log('Password email sent to:', email);

      user = (await this.userService.createUser(createUserDto)) as User;
      console.log('New user created:', user);
    }

    return user;
  }
}
