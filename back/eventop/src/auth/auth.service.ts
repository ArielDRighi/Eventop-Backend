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
  generatePassword(): string {
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allChars = lowerCase + upperCase + numbers + specialChars;

    let password = '';
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  async signIn(credential: SignInAuthDto) {
    const dbUser = await this.userService.findOneByEmail(credential.email);
    if (!dbUser) {
      throw new BadRequestException('User not found');
    }
    if (dbUser.isBanned) {
      throw new BadRequestException(`Banned user: ${dbUser.banReason}`);
    }
    const isPasswordValid = await bcrypt.compare(
      credential.password,
      dbUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
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
    console.log('Starting the registration process for the user:', user.email);

    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const dbUser = await this.userService.findOneByEmail(user.email);
    if (dbUser) {
      throw new BadRequestException('The email is already registered');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = {
      ...user,
      password: hashedPassword,
    };

    const createdUser = await this.userService.createUser(newUser);
    console.log('User created successfully:', createdUser.email);

    try {
      console.log('Trying to send the welcome email to:', user.email);
      await sendWelcomeEmail(user.email, user.name);
      console.log('Welcome email sent successfully to:', user.email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new BadRequestException(
        'There was a problem sending the welcome email',
      );
    }

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
      throw new BadRequestException('Invalid password');
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
      throw new BadRequestException('Passwords do not match');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.userService.updatePassword(user.userId, hashedPassword);
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    console.log(user);

    if (!user) {
      throw new BadRequestException('User not found');
    }
    const newPassword = this.generatePassword();
    console.log(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.userId, hashedPassword);
    try {
      await this.mailService.sendForgotPasswordEmail(email, newPassword);
    } catch (error) {
      throw new BadRequestException('Error sending email');
    }
    return { message: 'Mail sent' };
  }
}
