import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateUserDto } from 'src/auth/dto/createUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { use } from 'passport';
import { log } from 'console';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async findOneUser(userId: number): Promise<User> {
    return await this.userRepository.findOne({ where: { userId } });
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async createUser(user: CreateUserDto): Promise<Partial<User>> {
    const { email, name, password, role } = user;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }
    try {
      const newUser = this.userRepository.create({
        email,
        name,
        password,
        role,
      });
      const savedUser = await this.userRepository.save(newUser);
      const { password: _, ...result } = savedUser;
      return result;
    } catch (error) {
      throw new BadRequestException('Error al crear el usuario', error);
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<Omit<User, 'password'>[]> {
    try {
      const [users, total] = await this.userRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los usuarios',
        error,
      );
    }
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({ where: { userId } });
      if (!user) {
        throw new HttpException(
          `Usuario con ID ${userId} inexistente`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (Object.keys(updateUserDto).length === 0) {
        throw new HttpException(
          'No se proporcionaron datos para actualizar',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.userRepository.update(userId, updateUserDto);
      const updatedUser = await this.userRepository.findOne({
        where: { userId },
      });
      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el usuario',
        error,
      );
    }
  }

  async banUser(userId: number, reason: string, permanent: boolean) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (permanent) {
      try {
        await this.userRepository.remove(user);
        await this.mailService.sendBanNotification(
          user.email,
          reason,
          permanent,
        );
        return {
          message: 'Usuario baneado permanentemente y eliminado exitosamente',
        };
      } catch (error) {
        throw new HttpException(
          'Error al eliminar el usuario',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      user.isBanned = true;
      user.banReason = reason;
      user.banUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

      await this.userRepository.save(user);
      await this.mailService.sendBanNotification(user.email, reason, permanent);

      return { message: 'Usuario baneado temporalmente exitosamente' };
    }
  }

  async unbanUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    user.isBanned = false;
    user.banReason = null;
    user.banUntil = null;

    await this.userRepository.save(user);
    await this.mailService.sendUnbanNotification(user.email);

    return { message: 'Usuario desbaneado exitosamente' };
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    try {
      await this.userRepository.remove(user);
      return { message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      throw new HttpException(
        'Error al eliminar el usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
