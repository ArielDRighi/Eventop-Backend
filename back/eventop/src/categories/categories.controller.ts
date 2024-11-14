import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/CreateCategory.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@app/decorators/roles.decorator';
import { Role } from '@app/auth/enum/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@app/auth/roles.guard';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCategories() {
    try {
      return await this.categoryService.getCategories();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCategoryById(@Param('id') categoryId: number) {
    try {
      return await this.categoryService.getCategoryById(categoryId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categoryService.createCategory(createCategoryDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('id') categoryId: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      return await this.categoryService.updateCategory(
        categoryId,
        updateCategoryDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id') categoryId: number) {
    try {
      return await this.categoryService.deleteCategory(categoryId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
