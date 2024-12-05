import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/Payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create_preference')
  async createPreference(@Body() data: PaymentDto) {
    return {
      preferenceId: await this.paymentService.createPreference(data),
    };
  }
  @Get('status/:id')
  async getPaymentStatus(@Param('id') id: string) {
    return await this.paymentService.getPaymentStatus(id);
  }
}
