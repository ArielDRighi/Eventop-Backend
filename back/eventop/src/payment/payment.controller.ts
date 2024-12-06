import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Put,
  BadRequestException,
} from '@nestjs/common';
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

  @Post('success')
  async handlePaymentSuccess(
    @Body('collection_status') collectionStatus: boolean,
    @Body('payment_id') paymentId: string,
    @Body('status') status: boolean,
    @Body('preference_id') preferenceId: string,
    @Body('id') id: number,
  ) {
    console.log('Collection Status:', collectionStatus);
    console.log('Payment ID:', paymentId);
    console.log('Status:', status);
    console.log('ID:', id);
    try {
      const payment = await this.paymentService.handlePaymentSuccess(
        collectionStatus,
        paymentId,
        status,
        id,
        preferenceId,
      );
      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('failure')
  async handlePaymentFailure() {
    try {
      return 'Ocurrio un error al realizar el pago';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
