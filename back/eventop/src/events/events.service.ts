import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/events.entity';
import { CreateEventDto } from './dto/CreateEvent.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Category } from '@app/categories/entities/categories.entity';
import { Location } from '@app/locations/entities/locations.entity';
import { getDistance } from 'geolib';
import { Role } from '@app/auth/enum/roles.enum';
import { User } from '@app/users/entities/users.entity';
import { notifyAdminsAboutEvent } from '@app/config/nodeMailer';
import { sendApprovalEmail } from '@app/config/nodeMailer';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getEvents(): Promise<Event[]> {
    const events = await this.eventRepository.find({
      relations: { location_id: true, category_id: true, user: true },
    });
    if (!events.length) {
      throw new NotFoundException('No events found');
    }
    return events;
  }

  async getEventById(eventId: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: { location_id: true, category_id: true, user: true },
    });
    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return event;
  }
  async getAdminEmails(): Promise<string[]> {
    const admins = await this.userRepository.find({
      where: { role: Role.Admin },
      select: ['email'], // Solo necesitamos los correos
    });
    return admins.map((admin) => admin.email);
  }

  async createEvent(
    createEventDto: CreateEventDto,
    userId: number,
  ): Promise<Event> {
    const user = await this.userRepository.findOne({
      where: { userId },
    });
    console.log(user);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (user.role !== Role.Client && user.role !== Role.Admin) {
      throw new NotFoundException(
        'Solo los usuarios con rol de "client" o "admin" pueden crear eventos.',
      );
    }

    const {
      name,
      description,
      date,
      price,
      currency,
      location_id,
      imageUrl,
      category_id,
      quantityAvailable,
    } = createEventDto;

    const location = await this.locationRepository.findOne({
      where: { locationId: location_id },
    });
    if (!location) {
      throw new NotFoundException(
        `Locación con ID ${location_id} no encontrada`,
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { categoryId: category_id },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${category_id} no encontrada`,
      );
    }

    const newEvent = this.eventRepository.create({
      name,
      description,
      date,
      price,
      currency,
      location_id: location,
      imageUrl,
      category_id: category,
      quantityAvailable,
      user, // Aquí pasamos el objeto del usuario encontrado
      approved: false,
    });

    const savedEvent = await this.eventRepository.save(newEvent);

    // Incluimos las relaciones en la consulta final
    const eventWithRelations = await this.eventRepository.findOne({
      where: { eventId: savedEvent.eventId },
      relations: ['location_id', 'category_id', 'user'],
    });

    // Obtener correos de los administradores
    const adminsEmails = await this.getAdminEmails();

    if (adminsEmails.length > 0) {
      console.log(
        'Correos de administradores a los que se enviará la notificación:',
        adminsEmails,
      );
      await notifyAdminsAboutEvent(
        adminsEmails,
        user.name, // Nombre del cliente que creó el evento
        newEvent.name, // Nombre del evento creado
      );
      console.log(
        `Notificaciones enviadas a los administradores para el evento "${newEvent.name}"`,
      );
    } else {
      console.log(
        'No se encontraron administradores para enviar notificaciones.',
      );
    }

    return eventWithRelations;
  }

  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
    user: User, // Usuario autenticado
  ): Promise<Event> {
    // Buscar el evento por su ID
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['user'], // Relación con el usuario creador
    });
    console.log('Evento encontrado:', event);

    // Si el evento no existe, lanzamos una excepción
    if (!event) {
      throw new HttpException(
        `Evento con ID ${eventId} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Verificar que el usuario del evento no sea null
    if (!event.user) {
      throw new HttpException(
        'El evento no tiene un usuario asociado',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role === Role.Admin || user.role === Role.Client) {
      const updatedEvent = {
        ...updateEventDto,
        approved: false,
      };

      Object.assign(event, updatedEvent);
      console.log('nombre', event.user.name);

      try {
        const adminsEmails = await this.getAdminEmails();

        if (adminsEmails.length > 0) {
          console.log(
            'Correos de administradores a los que se enviará la notificación:',
            adminsEmails,
          );
          await notifyAdminsAboutEvent(
            adminsEmails,
            event.user.name, // Nombre del cliente que creó el evento
            event.name, // Nombre del evento creado
          );
          console.log(
            `Notificaciones enviadas a los administradores para el evento "${event.name}"`,
          );
        } else {
          console.log(
            'No se encontraron administradores para enviar notificaciones.',
          );
        }
        return await this.eventRepository.save(event);
      } catch (error) {
        throw new HttpException(
          'Falla en la actualización',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (event.user.userId !== user.userId) {
      throw new HttpException(
        'No tienes permisos para actualizar este evento',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async approveEvent(eventId: number, user: User): Promise<Event> {
    if (user.role !== Role.Admin) {
      throw new HttpException(
        'Solo los admins pueden aprobar eventos',
        HttpStatus.FORBIDDEN,
      );
    }
    console.log(user.role);

    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['user'], // Incluye la relación con el creador del evento
    });
    console.log('Evento encontrado:', event);

    if (!event) {
      throw new HttpException('Evento no encontrado', HttpStatus.NOT_FOUND);
    }

    event.approved = true;

    try {
      const approvedEvent = await this.eventRepository.save(event);
      console.log(event.user.email, event.user);

      // Enviar correo al cliente que creó el evento
      if (event.user && event.user.email) {
        const email = event.user.email;
        const name = event.user.name;
        const eventName = event.name;

        console.log(
          `Enviando correo a ${email} para notificar la aprobación del evento "${eventName}".`,
        );

        await sendApprovalEmail(email, name, eventName);
        console.log(`Correo de aprobación enviado a ${email}`);
      } else {
        console.log(
          'El evento no tiene un usuario asociado con un email válido.',
        );
      }

      return approvedEvent;
    } catch (error) {
      throw new HttpException(
        'Fallo en la aprobacion del evento',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteEvent(
    eventId: number,
    userId: number,
  ): Promise<{ message: string }> {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['user'],
    });

    if (!event) {
      throw new HttpException(
        `Evento con ID ${eventId} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Verificar si el usuario autenticado es el creador del evento
    if (event.user.userId !== userId) {
      throw new HttpException(
        'No tienes permisos para eliminar este evento',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      // Eliminar el evento
      await this.eventRepository.remove(event);
      return { message: 'Evento eliminado exitosamente' };
    } catch (error) {
      throw new HttpException('Failed to delete event', HttpStatus.BAD_REQUEST);
    }
  }

  async discountQuantity(eventId: number, quantity: number) {
    const event = await this.getEventById(eventId);
    if (event.quantityAvailable < quantity) {
      throw new HttpException(
        `Not enough tickets available for ${event.name}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    event.quantityAvailable -= quantity;
    event.quantitySold += quantity;
    return await this.eventRepository.save(event);
  }

  async getNearbyEvents(
    userLatitude: number,
    userLongitude: number,
    radius: number,
  ) {
    console.log('userLatitude', userLatitude);
    console.log('userLongitude', userLongitude);
    console.log('radius', radius);

    const events = await this.eventRepository.find({
      relations: ['location_id'],
    });
    return events.filter((event) => {
      const distance = getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        {
          latitude: event.location_id.latitude,
          longitude: event.location_id.longitude,
        },
      );
      return distance <= radius;
    });
  }

  async updateImage(eventId: number, imageUrl: string) {
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    event.imageUrl = imageUrl;
    return await this.eventRepository.save(event);
  }
}
