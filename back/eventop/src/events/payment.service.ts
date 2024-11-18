import { Injectable, NotFoundException } from '@nestjs/common';
import MercadoPagoConfig, { Preference } from 'mercadopago';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/events.entity';
import { EventService } from './events.service';
import { Controller, Post, Body } from '@nestjs/common'; // Importa los decoradores necesarios
import { sendPurchaseEmail } from '@app/config/nodeMailer';
import { CreateUserDto } from '@app/auth/dto/createUser.dto';

// Agrega credenciales
const client = new MercadoPagoConfig({
  accessToken:
    'APP_USR-7919481759638533-111217-7dc46b6e24d13dd0582f26d3cba133d4-38184233',
});

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly eventService: EventService,
  ) {}

  async createPreference(eventId: number, user: CreateUserDto) {
    const event = await this.eventService.getEventById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

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
              quantity: 1,
              unit_price: Number(event.price),
              id: event.eventId.toString(),
            },
          ],
          payer: {
            email: 'payer_email@example.com', // Puedes obtener el email del comprador si está disponible
          },
          back_urls: {
            success: 'https://www.tu-sitio.com/success',
            failure: 'https://www.tu-sitio.com/failure',
            pending: 'https://www.tu-sitio.com/pending',
          },
          auto_return: 'approved',
        },
      });
      await sendPurchaseEmail(user.email, user.name, event.name);
      return response.id;
    } catch (error) {
      console.log('Error', error);

      throw error;
    }
  }
}

// Define un controlador para manejar la ruta
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create_preference')
  async createPreference(@Body('eventId') eventId: number, email: CreateUserDto) {
    return {
      preferenceId: await this.paymentService.createPreference(eventId, email),
    };
  }
}