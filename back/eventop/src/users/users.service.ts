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
import { Comment } from './entities/comments.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
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

  async addComment(userId: number, commentText: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { userId },
        relations: ['comments'],
      });
      if (!user) {
        throw new HttpException(
          `User with ID ${userId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      const comment = this.commentRepository.create({ text: commentText });
      await this.commentRepository.save(comment);

      user.comments.push(comment);
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error at adding comment', error);
    }
  }

  async getAllComments(): Promise<{ message: string; comments: Comment[] }> {
    try {
      const comments = await this.commentRepository.find({
        relations: ['user'],
      });
      if (!comments) {
        throw new NotFoundException('No comments found');
      }
      return { message: 'Comments found', comments };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error at getting comments',
        error,
      );
    }
  }
}
