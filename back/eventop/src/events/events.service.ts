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
      select: ['email'],
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
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== Role.Client && user.role !== Role.Admin) {
      throw new NotFoundException(
        'Only users with the "client" or "admin" role can create events.',
      );
    }

    const {
      name,
      description,
      date,
      time,
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
      throw new NotFoundException(`Location with ID ${location_id} not found`);
    }

    const category = await this.categoryRepository.findOne({
      where: { categoryId: category_id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${category_id} not found`);
    }

    const newEvent = this.eventRepository.create({
      name,
      description,
      date,
      time,
      price,
      currency,
      location_id: location,
      imageUrl,
      category_id: category,
      quantityAvailable,
      user,
      approved: false,
    });

    const savedEvent = await this.eventRepository.save(newEvent);

    const eventWithRelations = await this.eventRepository.findOne({
      where: { eventId: savedEvent.eventId },
      relations: ['location_id', 'category_id', 'user'],
    });

    const adminsEmails = await this.getAdminEmails();

    if (adminsEmails.length > 0) {
      console.log(
        'Administrator emails to which the notification will be sent:',
        adminsEmails,
      );
      await notifyAdminsAboutEvent(adminsEmails, user.name, newEvent.name);
      console.log(
        `Notifications sent to administrators for the event "${newEvent.name}"`,
      );
    } else {
      console.log('No administrators were found to send notifications.');
    }

    return eventWithRelations;
  }

  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['user'],
    });
    console.log('Event Found:', event);

    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!event.user) {
      throw new HttpException(
        'The event does not have an associated user',
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
            'Administrator emails to which the notification will be sent:',
            adminsEmails,
          );
          await notifyAdminsAboutEvent(
            adminsEmails,
            event.user.name,
            event.name,
          );
          console.log(
            `Notifications sent to administrators for the event "${event.name}"`,
          );
        } else {
          console.log('No administrators were found to send notifications.');
        }
        return await this.eventRepository.save(event);
      } catch (error) {
        throw new HttpException('Update failed', HttpStatus.BAD_REQUEST);
      }
    }

    if (event.user.userId !== user.userId) {
      throw new HttpException(
        'You do not have permission to update this event',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async approveEvent(eventId: number, user: User): Promise<Event> {
    if (user.role !== Role.Admin) {
      throw new HttpException(
        'Only admins can approve events',
        HttpStatus.FORBIDDEN,
      );
    }
    console.log(user.role);

    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['user'],
    });
    console.log('Event Found:', event);

    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    event.approved = true;

    try {
      const approvedEvent = await this.eventRepository.save(event);
      console.log(event.user.email, event.user);

      if (event.user && event.user.email) {
        const email = event.user.email;
        const name = event.user.name;
        const eventName = event.name;

        console.log(
          `Sending mail to ${email} to notify the approval of the event "${eventName}".`,
        );

        await sendApprovalEmail(email, name, eventName);
        console.log(`Approval email sent to ${email}`);
      } else {
        console.log(
          'The event does not have an associated user with a valid email.',
        );
      }

      return approvedEvent;
    } catch (error) {
      throw new HttpException('Event approval failed', HttpStatus.BAD_REQUEST);
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

    const user = await this.userRepository.findOne({ where: { userId } });

    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.role !== Role.Admin && event.user.userId !== user.userId) {
      throw new HttpException(
        'You do not have permission to delete this event',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      await this.eventRepository.remove(event);
      return { message: 'Event successfully deleted' };
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
