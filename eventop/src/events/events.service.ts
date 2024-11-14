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

  async createEvent(createEventDto): Promise<Event> {
    let {
      name,
      description,
      date,
      price,
      currency,
      location_id,
      imageUrl,
      category_id,
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
      location_id,
      imageUrl,
      category_id,
    });

    const savedEvent = await this.eventRepository.save(newEvent);
    const eventWithRelations = await this.eventRepository.findOne({
      where: { eventId: newEvent.eventId },
      relations: ['location_id', 'category_id'],
    });
    return eventWithRelations;
  }

  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { eventId } });

    if (!event) {
      throw new HttpException(
        `Evento con ID ${eventId} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (typeof updateEventDto.date === 'string') {
      updateEventDto.date = new Date(updateEventDto.date);
    }
    Object.assign(event, updateEventDto);

    try {
      return await this.eventRepository.save(event);
    } catch (error) {
      throw new HttpException('Failed to update event', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteEvent(eventId: number): Promise<{ message: string }> {
    const event = await this.getEventById(eventId);
    console.log(event);

    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      await this.eventRepository.remove(event);
      return { message: 'Event deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete event', HttpStatus.BAD_REQUEST);
    }
  }
}
