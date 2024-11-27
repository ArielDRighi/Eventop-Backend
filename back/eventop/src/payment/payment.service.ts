// payment.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import MercadoPagoConfig, { Preference } from 'mercadopago';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/events.entity';
import { EventService } from '../events/events.service';
import { sendPurchaseEmail } from '@app/config/nodeMailer';
import { UserService } from '@app/users/users.service';
import { PaymentDto } from './dto/Payment.dto';
import { config as dotenvConfig } from 'dotenv';

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
  ) {}

  async createPreference(data: PaymentDto) {
    const { eventId, email, quantity } = data;

    const event = await this.eventService.getEventById(eventId);
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
      await sendPurchaseEmail(email, name, event.name);
      const clientMail = event.user.email;
      const clientName= event.user.name;
      if (clientMail) {
      await sendPurchaseEmail(clientMail, clientName, event.name);}
      else {
        throw new Error('Mail no encontrado');
      }
      return response.id;
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  }
}
