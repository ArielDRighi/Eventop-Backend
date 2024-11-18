import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentDto } from './dto/Payment.dto';

@ApiTags('payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create_preference')
  @ApiOperation({ summary: 'Create a payment preference' })
  @ApiResponse({
    status: 201,
    description: 'The preference has been successfully created.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createPreference(@Body() data: PaymentDto, @Res() res: Response) {
    try {
      const preferenceId = await this.paymentService.createPreference(data);
      res.status(201).json({ preferenceId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
