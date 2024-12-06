import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
  HttpException,
  HttpStatus,
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
import { Client } from 'socket.io/dist/client';
import { LocationService } from '@app/locations/locations.service';
import { Ticket } from './entities/tickets.entity';

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
    private readonly locationService: LocationService,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
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
              picture_url: event.imageUrl,
              category_id: 'tickets',
            },
          ],
          marketplace_fee: 0,
          payer: {
            name: user.name,
            email: user.email,
          },
          back_urls: {
            success:
              'https://eventop-frontend.vercel.app/payment/success/${event.eventId}',
            failure:
              'https://eventop-frontend.vercel.app/payment//failure/${event.eventId}',
            pending: 'https://www.tu-sitio.com/pending',
          },
          notification_url:
            'https://eventop-backend.onrender.com/notifications?source_news=webhooks',
          expires: false,
          auto_return: 'all',
          binary_mode: true,
          statement_descriptor: 'Eventop',
        },
      });

      console.log(response.id);

      return response.id;
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string) {
    const preference = new Preference(client);
    const response = await preference.get({ preferenceId: paymentId });
    return response;
  }

  async handlePaymentSuccess(
    collectionStatus: boolean,
    paymentId: string,
    status: boolean,
    id: number,
    preference_id: string,
  ) {
    const preference = new Preference(client);
    const response = await preference.get({ preferenceId: preference_id });
    console.log(response);

    const event = await this.eventRepository.findOne({
      where: { eventId: id },
      relations: ['location_id'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const eventId = id;
    if (collectionStatus == false) {
      console.log('El no pago fue aprobado');
      throw new BadRequestException('Payment was not approved');
    }
    if (status == false) {
      console.log('El no pago fue aprobado');
      throw new BadRequestException('Payment was not approved');
    }
    if (!paymentId) {
      throw new BadRequestException('Payment ID is required');
    }
    // Obtener la cantidad actualizada de entradas disponibles
    const updatedInventoryCount = await this.getUpdatedInventoryCount(
      Number(eventId),
    );

    // Transmitir la actualización de inventario
    this.monitorInventarioGateway.broadcastInventoryUpdate(
      Number(eventId),
      updatedInventoryCount,
    );

    const email = response.payer.email;
    const name = response.payer.name;
    const address = event.location_id.address;
    const date = event.date;
    const time = event.time;

    try {
      const newTicket = this.ticketRepository.create({
        preferenceId: paymentId,
        quantity: response.items[0].quantity,
        price: response.items[0].unit_price,
        event: event,
        user: response.payer,
      });

      await this.ticketRepository.save(newTicket);
      console.log('Ticket saved successfully:', newTicket);
      await sendPurchaseEmail(email, name, event.name, address, date, time);
      return { message: 'Entrada adquirida con exito!' };
    } catch (error) {
      console.error('Error saving ticket:', error);
      throw new HttpException(
        'Failed to save ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getUpdatedInventoryCount(eventId: number): Promise<number> {
    const event = await this.eventService.getEventById(eventId);
    return event.quantityAvailable; // Suponiendo que el evento tiene una propiedad quantityAvailable
  }

  async handleFreePayment(data: PaymentDto) {
    const user = await this.userService.findOneByEmail(data.email);
    if (!user) {
      throw new NotFoundException(`User with email ${data.email} not found`);
    }
    const event = await this.eventService.getEventById(data.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const updatedInventoryCount = await this.getUpdatedInventoryCount(
      Number(event.eventId),
    );

    // Transmitir la actualización de inventario
    this.monitorInventarioGateway.broadcastInventoryUpdate(
      Number(event.eventId),
      updatedInventoryCount,
    );

    const email = user.email;
    const name = user.name;
    const address = event.location_id.address;
    const date = event.date;
    const time = event.time;

    try {
      const newTicket = this.ticketRepository.create({
        preferenceId: 'free',
        quantity: data.quantity,
        price: event.price,
        event: event,
        user: user,
      });

      await this.ticketRepository.save(newTicket);
      console.log('Ticket saved successfully:', newTicket);
      await sendPurchaseEmail(email, name, event.name, address, date, time);
      return { message: 'Entrada adquirida con exito!' };
    } catch (error) {
      console.error('Error saving ticket:', error);
      throw new HttpException(
        'Failed to save ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
