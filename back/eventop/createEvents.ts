import { Event } from '@app/events/entities/events.entity';
import { Location } from '@app/locations/entities/locations.entity';
import { Category } from '@app/categories/entities/categories.entity';
import { User } from '@app/users/entities/users.entity';
import { connectionSource } from '@app/config/typeorm';

const events = [
  {
    name: 'Coldplay Concert',
    description: 'A live concert by Coldplay',
    date: '2025-12-01',
    time: '20:00',
    price: 10000,
    currency: 'ARS',
    locationId: 1,
    categoryId: 1,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626417/bdktl6jwabmfbaqax8rr.jpg',
    approved: true,
    quantityTotal: 5000,
    quantityAvailable: 5000,
    quantitySold: 0,
    userId: 1,
  },
  {
    name: 'Boca Juniors vs River Plate',
    description: 'Superclásico del fútbol argentino',
    date: '2025-12-05',
    time: '21:00',
    price: 15000,
    currency: 'ARS',
    locationId: 2,
    categoryId: 2,
    imageUrl: '',
    approved: true,
    quantityTotal: 50000,
    quantityAvailable: 50000,
    quantitySold: 0,
    userId: 2,
  },
  {
    name: 'Tech Conference 2023',
    description: 'Latest trends in technology',
    date: '2025-12-10',
    time: '09:00',
    price: 5000,
    currency: 'ARS',
    locationId: 3,
    categoryId: 3,
    imageUrl: '',
    approved: true,
    quantityTotal: 1000,
    quantityAvailable: 1000,
    quantitySold: 0,
    userId: 3,
  },
  {
    name: 'Art Exhibition',
    description: 'Explore the latest in contemporary art',
    date: '2025-12-15',
    time: '11:00',
    price: 3000,
    currency: 'ARS',
    locationId: 4,
    categoryId: 4,
    imageUrl: '',
    approved: true,
    quantityTotal: 500,
    quantityAvailable: 500,
    quantitySold: 0,
    userId: 4,
  },
  {
    name: 'Food Festival',
    description: 'Taste a variety of cuisines from around the world',
    date: '2025-12-20',
    time: '12:00',
    price: 2000,
    currency: 'ARS',
    locationId: 5,
    categoryId: 5,
    imageUrl: '',
    approved: true,
    quantityTotal: 1000,
    quantityAvailable: 1000,
    quantitySold: 0,
    userId: 5,
  },
  {
    name: 'Jazz Night',
    description: 'An evening of smooth jazz music',
    date: '2025-12-25',
    time: '19:00',
    price: 4000,
    currency: 'ARS',
    locationId: 1,
    categoryId: 1,
    imageUrl: '',
    approved: true,
    quantityTotal: 300,
    quantityAvailable: 300,
    quantitySold: 0,
    userId: 6,
  },
  {
    name: 'Rock Festival',
    description: 'A festival featuring top rock bands',
    date: '2025-12-30',
    time: '17:00',
    price: 8000,
    currency: 'ARS',
    locationId: 2,
    categoryId: 1,
    imageUrl: '',
    approved: true,
    quantityTotal: 2000,
    quantityAvailable: 2000,
    quantitySold: 0,
    userId: 7,
  },
  {
    name: 'Classical Music Concert',
    description: 'A concert featuring classical music',
    date: '2025-01-05',
    time: '16:00',
    price: 6000,
    currency: 'ARS',
    locationId: 3,
    categoryId: 1,
    imageUrl: '',
    approved: true,
    quantityTotal: 800,
    quantityAvailable: 800,
    quantitySold: 0,
    userId: 8,
  },
  {
    name: 'Basketball Game',
    description: 'A thrilling basketball game',
    date: '2025-01-10',
    time: '15:00',
    price: 7000,
    currency: 'ARS',
    locationId: 4,
    categoryId: 2,
    imageUrl: '',
    approved: true,
    quantityTotal: 10000,
    quantityAvailable: 10000,
    quantitySold: 0,
    userId: 9,
  },
  {
    name: 'Soccer Match',
    description: 'An exciting soccer match',
    date: '2025-01-15',
    time: '14:00',
    price: 9000,
    currency: 'ARS',
    locationId: 5,
    categoryId: 2,
    imageUrl: '',
    approved: true,
    quantityTotal: 30000,
    quantityAvailable: 30000,
    quantitySold: 0,
    userId: 10,
  },
];

async function createEvents() {
  const dataSource = await connectionSource.initialize();
  const eventRepository = dataSource.getRepository(Event);
  const locationRepository = dataSource.getRepository(Location);
  const categoryRepository = dataSource.getRepository(Category);
  const userRepository = dataSource.getRepository(User);

  try {
    for (const event of events) {
      const location = await locationRepository.findOneBy({
        locationId: event.locationId,
      });
      if (!location) {
        console.error(`Location with id ${event.locationId} not found`);
        continue;
      }

      const category = await categoryRepository.findOneBy({
        categoryId: event.categoryId,
      });
      if (!category) {
        console.error(`Category with id ${event.categoryId} not found`);
        continue;
      }

      const user = await userRepository.findOneBy({
        userId: event.userId,
      });
      if (!user) {
        console.error(`User with id ${event.userId} not found`);
        continue;
      }

      const newEvent = eventRepository.create({
        ...event,
        location_id: location,
        category_id: category,
        user: user,
      });
      await eventRepository.save(newEvent);
    }
    console.log('Events created successfully');
  } catch (error) {
    console.error('Error creating events:', error);
  } finally {
    await dataSource.destroy();
  }
}

createEvents();
