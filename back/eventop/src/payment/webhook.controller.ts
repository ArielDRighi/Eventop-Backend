import { Controller, Post, Body, HttpCode } from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
  @Post('mercadopago')
  @HttpCode(200)
  async handleMercadoPagoNotification(@Body() body: any) {
    console.log('Webhook received:', body);
    // Aquí puedes llamar a un servicio para procesar la notificación
  }
}
