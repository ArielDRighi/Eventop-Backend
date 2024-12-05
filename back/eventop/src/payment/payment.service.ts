// payment.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/events.entity';
import { EventService } from '../events/events.service';
import { sendPurchaseEmail } from '@app/config/nodeMailer';
import { UserService } from '@app/users/users.service';
import { PaymentDto } from './dto/Payment.dto';
import { config as dotenvConfig } from 'dotenv';
import { MonitorInventarioGateway } from '../gateways/monitor-inventario/monitor-inventario.gateway';

dotenvConfig({ path: '.env' });

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly monitorInventarioGateway: MonitorInventarioGateway,
  ) {}

  async createPreference(data: PaymentDto) {
    const { eventId, email, quantity } = data;

    const event = await this.eventService.getEventById(Number(eventId));
    const discountQuantity = await this.eventService.discountQuantity(
      eventId,
      Number(quantity),
    );
    const user = await this.userService.findOneByEmail(email);

    console.log('Quantity:', quantity, typeof quantity);

    if (!discountQuantity) {
      throw new BadRequestException('Not enough tickets available');
    }
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const name = user.name;
    const unitPrice = Number(event.price);
    if (isNaN(unitPrice)) {
      throw new Error('Event price is not a valid number');
    }

    const preference = new Preference(client);

    try {
      // Crear la preferencia
      const response = await preference.create({
        body: {
          items: [
            {
              title: event.name,
              description: event.description,
              quantity: Number(quantity),
              unit_price: unitPrice,
              id: event.eventId.toString(),
            },
          ],
          payer: {
            email: user.email,
          },
          back_urls: {
            success: 'https://www.tu-sitio.com/success',
            failure: 'https://www.tu-sitio.com/failure',
            pending: 'https://www.tu-sitio.com/pending',
          },
          auto_return: 'approved',
        },
      });

      // Obtener la cantidad actualizada de entradas disponibles
      const updatedInventoryCount = await this.getUpdatedInventoryCount(
        Number(eventId),
      );

      // Transmitir la actualización de inventario
      this.monitorInventarioGateway.broadcastInventoryUpdate(
        Number(eventId),
        updatedInventoryCount,
      );

      // Verificar si la preferencia fue creada correctamente y si la transacción fue aprobada
      // if (response.auto_return === 'approved') {
      //   // Solo enviar el correo si el pago fue aprobado
      //   await sendPurchaseEmail(email, name, event.name);
      // } else {
      //   console.log('El pago no fue aprobado, no se enviará el correo');
      // }

      return response.id;
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  }
  async getPaymentStatus(paymentId: string) {
    const payment = new Payment(client);
    try {
      const response = await payment.get({ id: paymentId });
      return response;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw new BadRequestException('Error fetching payment status');
    }
  }

  private async getUpdatedInventoryCount(eventId: number): Promise<number> {
    const event = await this.eventService.getEventById(eventId);
    return event.quantityAvailable; // Suponiendo que el evento tiene una propiedad quantityAvailable
  }
}
