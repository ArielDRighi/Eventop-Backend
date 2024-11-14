import { DataSource } from 'typeorm';
import { Location } from '@app/locations/entities/locations.entity';
import { connectionSource } from '@app/config/typeorm';

const locations = [
  {
    city: 'Ciudad Central',
    state: 'Estado Central',
    country: 'País X',
    address: 'Av. del Parque 123',
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    city: 'Pueblo Viejo',
    state: 'Estado Viejo',
    country: 'País X',
    address: 'Calle Principal 456',
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    city: 'Ciudad Avanzada',
    state: 'Estado Avanzado',
    country: 'País X',
    address: 'Av. Tecnológica 789',
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    city: 'Ciudad Verde',
    state: 'Estado Verde',
    country: 'País Y',
    address: 'Av. del Sol 101',
    latitude: 29.7604,
    longitude: -95.3698,
  },
  {
    city: 'Ciudad Nueva',
    state: 'Estado Nuevo',
    country: 'País Y',
    address: 'Calle de la Cultura 111',
    latitude: 25.7617,
    longitude: -80.1918,
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
