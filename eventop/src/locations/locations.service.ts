import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/locations.entity';
import { CreateLocationDto } from './dto/CreateLocation.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async getLocations(): Promise<Location[]> {
    const locations = await this.locationRepository.find();
    if (!locations.length) {
      throw new NotFoundException('No locations found');
    }
    return locations;
  }

  async getLocationById(locationId: number): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { locationId },
    });
    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }
    return location;
  }

  async createLocation(
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    const newLocation = this.locationRepository.create(createLocationDto);
    try {
      return await this.locationRepository.save(newLocation);
    } catch (error) {
      throw new BadRequestException('Failed to create location');
    }
  }

  async deleteLocation(locationId: number) {
    const location = await this.getLocationById(locationId);
    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }
    try {
      await this.locationRepository.remove(location);
    } catch (error) {
      throw new BadRequestException('Failed to delete location');
    }
  }
}
