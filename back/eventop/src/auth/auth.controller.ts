import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signIn.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() credential: SignInAuthDto) {
    try {
      return await this.authService.signIn(credential);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() user: CreateUserDto) {
    try {
      return await this.authService.signUp(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('protected')
  @HttpCode(HttpStatus.OK)
  async getProtected(@Req() req) {
    try {
      return req.user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('callback')
  @UseGuards(AuthGuard('auth0'))
  async authCallback(@Req() req, @Res() res) {
    const { user } = req;
    await this.authService.handleAuth0Callback(user);
    res.redirect('/'); // Redirige a la ruta deseada después del inicio de sesión exitoso
  }
}
