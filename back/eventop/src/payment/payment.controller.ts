import { Controller, Post, Body, Get, Param,Query, Put } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/Payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create_preference')
  async createPreference(@Body() data: PaymentDto) {
    const preferenceId = await this.paymentService.createPreference(data);
    return { preferenceId };
  }

  @Get('status/:pref_id')
async getPaymentStatus(@Param('pref_id') prefId: string) {
  const status = await this.paymentService.getPaymentStatus(prefId);
  console.log(status);
  return status;
}

@Get('success/:id')
  async handlePaymentSuccess(
    @Query('collection_status') collectionStatus: boolean,
    @Query('payment_id') paymentId: string,
    @Query('status') status: boolean,
    @Query('preference_id') preference_id: string,
    @Param('id') id: number,
  ) {
    console.log('Collection Status:', collectionStatus);
    console.log('Payment ID:', paymentId);
    console.log('Status:', status);
    console.log('ID:', id);
    

    const payment = await this.paymentService.handlePaymentSuccess(collectionStatus, paymentId, status,id,preference_id);
    return payment;
  }
}
