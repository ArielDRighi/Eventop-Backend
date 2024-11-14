import { Module } from '@nestjs/common';
import { LocationController } from './locations.controller';
import { LocationService } from './locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/locations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationsModule {}
