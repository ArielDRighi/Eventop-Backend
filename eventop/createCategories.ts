import { DataSource } from 'typeorm';
import { Category } from '@app/categories/entities/categories.entity';
import { connectionSource } from '@app/config/typeorm';

const categories = [
  { name: 'Music' },
  { name: 'Sports' },
  { name: 'Technology' },
  { name: 'Art' },
  { name: 'Food' },
];

async function createCategories() {
  const dataSource = await connectionSource.initialize();
  const categoryRepository = dataSource.getRepository(Category);

  try {
    for (const category of categories) {
      const newCategory = categoryRepository.create(category);
      await categoryRepository.save(newCategory);
    }
    console.log('Categories created successfully');
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await dataSource.destroy();
  }
}

createCategories();
