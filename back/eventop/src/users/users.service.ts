import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateUserDto } from 'src/auth/dto/createUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { use } from 'passport';
import { log } from 'console';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }
  async findOneUser(userId: number): Promise<User> {
    return await this.userRepository.findOne({ where: { userId } });
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

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
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
    Object.assign(user, updateUserDto);
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      console.log('error al guardar el usuario', error);
      throw new HttpException(
        'Fallo al actualizar el usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
