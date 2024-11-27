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

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getEvents(): Promise<Event[]> {
    const events = await this.eventRepository.find({
      relations: { location_id: true, category_id: true },
    });
    if (!events.length) {
      throw new NotFoundException('No events found');
    }
    return events;
  }

  async getEventById(eventId: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: { location_id: true, category_id: true },
    });
    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return event;
  }

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    if ( createEventDto.user.role !== Role.Client || Role.Admin) {
      throw new Error('Solo los usuarios con rol de "client" o "admin" pueden crear eventos.');
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
      throw new Error(`Locación con ID ${location_id} no encontrada`);
    }

    const category = await this.categoryRepository.findOne({
      where: { categoryId: category_id },
    });
    if (!category) {
      throw new Error(`Categoria con ID ${category_id} no encontrada`);
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
      user: createEventDto.user,
      approved: false, 
    });

    const savedEvent = await this.eventRepository.save(newEvent);
    const eventWithRelations = await this.eventRepository.findOne({
      where: { eventId: newEvent.eventId },
      relations: ['location_id', 'category_id', 'user'],
    });
    return eventWithRelations;
  }

  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
    user: User,  // Usuario autenticado
  ): Promise<Event> {
    // Buscar el evento por su ID
    const event = await this.eventRepository.findOne({ 
      where: { eventId }, 
      relations: ['user']  // Relación con el usuario creador
    });
  
    // Si el evento no existe, lanzamos una excepción
    if (!event) {
      throw new HttpException(
        `Evento con ID ${eventId} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
  
    if (user.role === Role.Admin || user.role === Role.Client) {
      
      Object.assign(event, updateEventDto);
      try {
        return await this.eventRepository.save(event);
      } catch (error) {
        throw new HttpException('falla en la actualizacion', HttpStatus.BAD_REQUEST);
      }
    }
  
    if (event.user.userId !== user.userId) {
      throw new HttpException('No tienes permisos para actualizar este evento', HttpStatus.FORBIDDEN);
    }}
    

  

  async approveEvent(eventId: number, user: User): Promise<Event> {
    if (user.role !== Role.Admin) {
      throw new HttpException('Solo los admins pueden aprobar eventos', HttpStatus.FORBIDDEN);
    }
  
    const event = await this.eventRepository.findOne({ where: { eventId } });
  
    if (!event) {
      throw new HttpException('Evento no encontrado', HttpStatus.NOT_FOUND);
    }
  
    event.approved = true;
  
    try {
      return await this.eventRepository.save(event);
    } catch (error) {
      throw new HttpException('Fallo en la aprobacion del evento', HttpStatus.BAD_REQUEST);
    }
  }
  
  

  async deleteEvent(
    eventId: number,
    user: User,  // Asegúrate de pasar el usuario autenticado
  ): Promise<{ message: string }> {
    const event = await this.eventRepository.findOne({ where: { eventId }, relations: ['user'] });
  
    if (!event) {
      throw new HttpException(
        `Evento con ID ${eventId} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
  
    // Verificar si el usuario autenticado es el creador del evento
    if (event.user.userId !== user.userId) {
      throw new HttpException('No tienes permisos para eliminar este evento', HttpStatus.FORBIDDEN);
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
