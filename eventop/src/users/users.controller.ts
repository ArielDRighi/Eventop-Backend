import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  HttpCode,
  Put,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/auth/dto/createUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/auth/enum/roles.enum';
import { RoleGuard } from 'src/auth/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '@app/events/cloudinary.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    try {
      return req.user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getAllUsers() {
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.userService.updateUser(userId, updateUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new HttpException(
          'No se proporcionó una imagen',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Sube la imagen a Cloudinary y obtiene la URL
      const imageUrl = await this.cloudinaryService.uploadImage(file);

      // Crea un objeto parcial de tipo UpdateUserDto solo con imageUrl
      const updateData: UpdateUserDto = { imageUrl };

      // Actualiza el usuario solo con la URL de la imagen
      const updatedUser = await this.userService.updateUser(userId, updateData);
      return { message: 'Imagen de perfil cargada correctamente', updatedUser };
    } catch (error) {
      console.error('Error al subir la imagen y actualizar el usuario:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
