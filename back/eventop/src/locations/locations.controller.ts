import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './locations.service';
import { CreateLocationDto } from './dto/CreateLocation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@app/decorators/roles.decorator';
import { Role } from '@app/auth/enum/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@app/auth/roles.guard';

@ApiTags('locations')
@ApiBearerAuth('access-token')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getLocations() {
    try {
      return await this.locationService.getLocations();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getLocationById(@Param('id') locationId: number) {
    try {
      return await this.locationService.getLocationById(locationId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createLocation(@Body() createLocationDto: CreateLocationDto) {
    try {
      return await this.locationService.createLocation(createLocationDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLocation(@Param('id') locationId: number) {
    try {
      return await this.locationService.deleteLocation(locationId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
