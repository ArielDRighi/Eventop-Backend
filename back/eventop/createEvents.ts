import { Event } from '@app/events/entities/events.entity';
import { Location } from '@app/locations/entities/locations.entity';
import { Category } from '@app/categories/entities/categories.entity';
import { User } from '@app/users/entities/users.entity';
import { connectionSource } from '@app/config/typeorm';

const events = [
  {
    name: 'Concert',
    description: 'A live music concert',
    date: '2023-12-01',
    price: 40,
    currency: 'ARS',
    locationId: 1,
    categoryId: 1,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626417/bdktl6jwabmfbaqax8rr.jpg',
    approved: true,
    quantityTotal: 100,
    quantityAvailable: 100,
    quantitySold: 0,
    userId: 1, // ID del usuario creador
  },
  {
    name: 'Art Exhibition',
    description: 'Explore the latest in contemporary art',
    date: '2023-12-05',
    price: 500,
    currency: 'ARS',
    locationId: 2,
    categoryId: 2,
    imageUrl: '',
    approved: true,
    quantityTotal: 100,
    quantityAvailable: 100,
    quantitySold: 0,
    userId: 2, // ID del usuario creador
  },
  {
    name: 'Food Festival',
    description: 'Taste a variety of cuisines from around the world',
    date: '2023-12-10',
    price: 90,
    currency: 'ARS',
    locationId: 3,
    categoryId: 3,
    imageUrl: '',
    approved: true,
    quantityTotal: 100,
    quantityAvailable: 100,
    quantitySold: 0,
    userId: 3, // ID del usuario creador
  },
  // Agrega más eventos según sea necesario
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
