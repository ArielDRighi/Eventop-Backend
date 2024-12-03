import { DataSource } from 'typeorm';
import { User } from '@app/users/entities/users.entity';
import { connectionSource } from '@app/config/typeorm';

const users = [
  {
    name: 'Juan Perez',
    email: 'juan.perez@example.com',
    password: 'Password1!',
  },
  {
    name: 'Maria Gomez',
    email: 'maria.gomez@example.com',
    password: 'Password2!',
  },
  {
    name: 'Carlos Lopez',
    email: 'carlos.lopez@example.com',
    password: 'Password3!',
  },
  {
    name: 'Ana Martinez',
    email: 'ana.martinez@example.com',
    password: 'Password4!',
  },
  {
    name: 'Luis Fernandez',
    email: 'luis.fernandez@example.com',
    password: 'Password5!',
  },
  {
    name: 'Laura Sanchez',
    email: 'laura.sanchez@example.com',
    password: 'Password6!',
  },
  {
    name: 'Pedro Ramirez',
    email: 'pedro.ramirez@example.com',
    password: 'Password7!',
  },
  {
    name: 'Sofia Torres',
    email: 'sofia.torres@example.com',
    password: 'Password8!',
  },
  {
    name: 'Diego Alvarez',
    email: 'diego.alvarez@example.com',
    password: 'Password9!',
  },
  {
    name: 'Marta Diaz',
    email: 'marta.diaz@example.com',
    password: 'Password10!',
  },
];

async function createUsers() {
  const dataSource = await connectionSource.initialize();
  const userRepository = dataSource.getRepository(User);

  try {
    for (const user of users) {
      const newUser = userRepository.create(user);
      await userRepository.save(newUser);
    }
    console.log('Users created successfully');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await dataSource.destroy();
  }
}

createUsers();
