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
  Query,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/auth/dto/createUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/auth/enum/roles.enum';
import { RoleGuard } from 'src/auth/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '@app/events/cloudinary.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UpdateRoleDto } from './dto/UpdateRoleDto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Roles(Role.Admin, Role.User, Role.Client)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('email')
  @ApiQuery({ name: 'email', type: String, required: true })
  async findOneByEmail(@Query('email') email: string) {
    const result = await this.userService.findOneByEmail(email);
    return result;
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('total-users')
  async getTotalUsers() {
    return await this.userService.getTotalUsers();
  }

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
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Email already registered or banned.',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getAllUsers(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    try {
      return await this.userService.getAllUsers(page, limit);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Put(':id/role')
  async updateRole(
    @Param('id') userId: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.userService.updateUserRole(userId, updateRoleDto.role);
  }


  @Roles(Role.Admin, Role.User, Role.Client)
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

  @Roles(Role.Admin, Role.User, Role.Client)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new HttpException('No image provided', HttpStatus.BAD_REQUEST);
      }

      const imageUrl = await this.cloudinaryService.uploadImage(file);

      const updateData: UpdateUserDto = { imageUrl };

      const updatedUser = await this.userService.updateUser(userId, updateData);
      return { message: 'Imagen de perfil cargada correctamente', updatedUser };
    } catch (error) {
      console.error('Error uploading image and updating user:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('comments')
  async getAllComments() {
    try {
      return await this.userService.getAllComments();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Admin, Role.User, Role.Client)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) userId: number) {
    try {
      return await this.userService.findOneUser(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.User, Role.Client, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post(':id/comment')
  @ApiOperation({ summary: 'Add a comment to a user' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({ schema: { example: { comment: 'This is a comment' } } })
  async addComment(
    @Param('id', ParseIntPipe) userId: number,
    @Body('comment') commentText: string,
  ) {
    try {
      return await this.userService.addComment(userId, commentText);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Put(':id/ban')
  @ApiOperation({ summary: 'Ban a user' })
  @ApiResponse({ status: 200, description: 'User banned successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async banUser(@Param('id') userId: number, @Body() banUserDto: BanUserDto) {
    return await this.userService.banUser(
      userId,
      banUserDto.reason,
      banUserDto.permanent,
    );
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Put(':id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async unbanUser(@Param('id') userId: number) {
    return await this.userService.unbanUser(userId);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async deleteUser(@Param('id') userId: number) {
    return await this.userService.deleteUser(userId);
  }
}
