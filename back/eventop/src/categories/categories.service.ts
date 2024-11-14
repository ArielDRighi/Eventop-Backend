import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/CreateCategory.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategories(): Promise<Category[]> {
    const categories = await this.categoryRepository.find();
    if (!categories.length) {
      throw new NotFoundException('No categories found');
    }
    return categories;
  }

  async getCategoryById(categoryId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId },
    });
    if (!category) {
      throw new HttpException(
        `Category with ID ${categoryId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return category;
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    try {
      return await this.categoryRepository.save(newCategory);
    } catch (error) {
      throw new HttpException(
        'Failed to create category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateCategory(
    categoryId: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId },
    });

    if (!category) {
      throw new HttpException(
        `Categoría con ID ${categoryId} no encontrada`,
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(category, updateCategoryDto);

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new HttpException(
        'Failed to update category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteCategory(categoryId: number): Promise<{ message: string }> {
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      throw new HttpException(
        `Category with ID ${categoryId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      await this.categoryRepository.remove(category);
      return { message: `Categoria con ID ${categoryId} eliminada con éxito!` };
    } catch (error) {
      throw new HttpException(
        'Failed to delete category',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
