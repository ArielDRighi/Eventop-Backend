import { DataSource } from 'typeorm';
import { Location } from '@app/locations/entities/locations.entity';
import { connectionSource } from '@app/config/typeorm';

const locations = [
  {
    city: 'Córdoba',
    state: 'Córdoba',
    country: 'Argentina',
    address: 'Av. Colón 123',
    latitude: -31.4201,
    longitude: -64.1888,
  },
  {
    city: 'Corrientes',
    state: 'Corrientes',
    country: 'Argentina',
    address: 'Calle Junín 456',
    latitude: -27.4696,
    longitude: -58.8306,
  },
  {
    city: 'San Juan',
    state: 'San Juan',
    country: 'Argentina',
    address: 'Av. Libertador 789',
    latitude: -31.5375,
    longitude: -68.5364,
  },
  {
    city: 'Buenos Aires',
    state: 'Buenos Aires',
    country: 'Argentina',
    address: 'Av. 9 de Julio 101',
    latitude: -34.6037,
    longitude: -58.3816,
  },
  {
    city: 'Salta',
    state: 'Salta',
    country: 'Argentina',
    address: 'Calle Balcarce 111',
    latitude: -24.7821,
    longitude: -65.4232,
  },
];

async function createLocations() {
  const dataSource = await connectionSource.initialize();
  const locationRepository = dataSource.getRepository(Location);

  try {
    for (const location of locations) {
      const newLocation = locationRepository.create(location);
      await locationRepository.save(newLocation);
    }
    console.log('Locations created successfully');
  } catch (error) {
    console.error('Error creating locations:', error);
  } finally {
    await dataSource.destroy();
  }
}

createLocations();
