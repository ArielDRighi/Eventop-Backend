import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/Payment.dto';
import { Roles } from '@app/decorators/roles.decorator';
import { Role } from '@app/auth/enum/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@app/auth/roles.guard';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles(Role.User)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('create_preference')
  async createPreference(@Body() data: PaymentDto, @Res() res: Response) {
    try {
      const preferenceId = await this.paymentService.createPreference(data);
      return res.status(HttpStatus.OK).json({ preferenceId });
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        return res.redirect('/signout');
      }
      throw error;
    }
  }
}
