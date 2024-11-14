import { DataSource } from 'typeorm';
import { Event } from '@app/events/entities/events.entity';
import { Location } from '@app/locations/entities/locations.entity';
import { Category } from '@app/categories/entities/categories.entity';
import { connectionSource } from '@app/config/typeorm';

const events = [
  {
    name: 'Concert',
    description: 'A live music concert',
    date: '2023-12-01',
    price: 50.0,
    currency: 'USD',
    locationId: 1,
    categoryId: 1,
  },
  {
    name: 'Football Match',
    description: 'A local football match',
    date: '2023-11-15',
    price: 30.0,
    currency: 'USD',
    locationId: 2,
    categoryId: 2,
  },
  {
    name: 'Tech Conference',
    description: 'A technology conference',
    date: '2023-10-20',
    price: 100.0,
    currency: 'USD',
    locationId: 3,
    categoryId: 3,
  },
  {
    name: 'Art Exhibition',
    description: 'An art exhibition',
    date: '2023-09-10',
    price: 20.0,
    currency: 'USD',
    locationId: 4,
    categoryId: 4,
  },
  {
    name: 'Food Festival',
    description: 'A food festival',
    date: '2023-08-05',
    price: 10.0,
    currency: 'USD',
    locationId: 5,
    categoryId: 5,
  },
];

async function createEvents() {
  const dataSource = await connectionSource.initialize();
  const eventRepository = dataSource.getRepository(Event);
  const locationRepository = dataSource.getRepository(Location);
  const categoryRepository = dataSource.getRepository(Category);

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

      const newEvent = eventRepository.create({
        ...event,
        location_id: location,
        category_id: category,
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
