import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/Payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create_preference')
  async createPreference(@Body() data: any) {
    return {
      preferenceId: await this.paymentService.createPreference(data),
    };
  }
}

function dotenvConfig() {
  throw new Error('Function not implemented.');
}
