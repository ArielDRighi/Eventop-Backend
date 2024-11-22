import { Event } from '@app/events/entities/events.entity';
import { Location } from '@app/locations/entities/locations.entity';
import { Category } from '@app/categories/entities/categories.entity';
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
    quantityAvailable: 100,
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
    quantityAvailable: 100,
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
    quantityAvailable: 100,
  },
  {
    name: 'Tech Conference',
    description: 'Latest trends and innovations in tech',
    date: '2023-12-15',
    price: 100,
    currency: 'ARS',
    locationId: 4,
    categoryId: 4,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626324/zs4ysqygsat3qazvqiq2.avif',
    approved: true,
    quantityAvailable: 200,
  },
  {
    name: 'Comedy Show',
    description: 'Laugh out loud with top comedians',
    date: '2023-12-18',
    price: 250,
    currency: 'ARS',
    locationId: 5,
    categoryId: 5,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626291/upn7irlampilruqhedz3.jpg',
    approved: true,
    quantityAvailable: 500,
  },
  {
    name: 'Dance Performance',
    description: 'Experience a mesmerizing dance performance',
    date: '2023-12-20',
    price: 55,
    currency: 'ARS',
    locationId: 3,
    categoryId: 2,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626259/x4t0ppcexicmjtmd4gaz.jpg',
    approved: true,
    quantityAvailable: 1000,
  },
  {
    name: 'Evento gratuito',
    description: 'Support a cause at a beautiful gala event',
    date: '2023-12-30',
    price: 0,
    currency: 'ARS',
    locationId: 4,
    categoryId: 3,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626095/p6mmfcj8zegqd4mbplay.jpg',
    approved: true,
    quantityAvailable: 150,
  },
  {
    name: 'Film Screening',
    description: 'Watch an exclusive film screening',
    date: '2023-12-25',
    price: 15,
    currency: 'ARS',
    locationId: 1,
    categoryId: 2,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626218/muoupqrua1oasw4wjtj0.jpg',
    approved: true,
    quantityAvailable: 1500,
  },
  {
    name: 'Science Fair',
    description: 'Discover amazing science projects and experiments',
    date: '2023-12-27',
    price: 20,
    currency: 'ARS',
    locationId: 3,
    categoryId: 2,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626179/hex5lmnuhihmrmhoihwm.jpg',
    approved: true,
    quantityAvailable: 100,
  },
  {
    name: 'Literary Festival',
    description: 'Meet authors and attend literary sessions',
    date: '2023-12-28',
    price: 200,
    currency: 'ARS',
    locationId: 2,
    categoryId: 1,
    imageUrl:
      'https://res.cloudinary.com/dcaqkyvfu/image/upload/v1731626132/msuvagzau77xiacs4w6u.jpg',
    approved: true,
    quantityAvailable: 3,
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
