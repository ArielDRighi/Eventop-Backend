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
  Put,
  Param,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signIn.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Public } from '@app/decorators/public.decorator';
import { User } from '@app/users/entities/users.entity';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { assignPasswordDto } from './dto/assignPassword.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() CreateUserDto: SignInAuthDto) {
    try {
      return await this.authService.signIn(CreateUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('signinoauth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with OAuth' })
  @ApiResponse({ status: 200, description: 'Successfully signed in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: User })
  async signInOauth(@Body() user: User) {
    try {
      return await this.authService.signInOauth(user);
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

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  @ApiOperation({ summary: 'Login with Google' })
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.signInOauth(req.user);
    res.redirect(
      `https://eventop-frontend.vercel.app/login?token=${response.accessToken}`,
    );
  }

  @Put(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() passwords: ChangePasswordDto,
    @Param('id') userId: number,
  ) {
    try {
      return await this.authService.changePassword(passwords, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
  @Put('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Query('email') email: string) {
    try {
      console.log(email);

      return await this.authService.forgotPassword(email);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Put(':id/assign-password')
  @HttpCode(HttpStatus.OK)
  async assignPassword(
    @Body() passwords: assignPasswordDto,
    @Param('id') userId: number,
  ) {
    try {
      return await this.authService.assignPassword(passwords, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
