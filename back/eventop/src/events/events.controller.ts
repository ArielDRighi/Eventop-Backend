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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { EventService } from './events.service';
import { CreateEventDto } from './dto/CreateEvent.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from '@app/decorators/roles.decorator';
import { Role } from '@app/auth/enum/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@app/auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { User } from '@app/users/entities/users.entity';
import { Request } from '@nestjs/common';

@ApiTags('events')
@ApiBearerAuth('access-token')
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getEvents() {
    try {
      return await this.eventService.getEvents();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('nearby')
  @HttpCode(HttpStatus.OK)
  async getNearbyEvents(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number,
  ) {
    console.log('Latitude', latitude);
    console.log('longitude', longitude);
    console.log('radius', radius);
    try {
      return await this.eventService.getNearbyEvents(
        latitude,
        longitude,
        radius,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEventById(@Param('id') eventId: number) {
    try {
      return await this.eventService.getEventById(eventId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles(Role.Admin, Role.Client)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('create')
  @ApiBody({ type: CreateEventDto })
  @UseInterceptors(FileInterceptor('image'))
  async createEvent(
    @Body('data') data: any, // Lo recibimos como 'any' para manejar el texto JSON.
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Parseamos el campo body que contiene el JSON.
      const createEventDto: CreateEventDto = JSON.parse(data);

      // Subimos la imagen a Cloudinary y obtenemos la URL
      const imageUrl = await this.cloudinaryService.uploadImage(file);

      // Creamos el evento
      const event = {
        ...createEventDto,
        imageUrl,
      };

      // Guardamos el evento en la base de datos
      const eventCreated = await this.eventService.createEvent(event);

      return { message: 'Evento creado exitosamente', eventCreated };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin, Role.Client)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateEvent(
    @Param('id') eventId: number,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ){const user = req.user;
    
    try {
      return await this.eventService.updateEvent(eventId, updateEventDto, user );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles(Role.Admin)
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Delete(':id')
@HttpCode(HttpStatus.OK)
async deleteEvent(
  @Param('id') eventId: number,  
  @Request() req, 
) {
  const user = req.user;
  
  try {
    return await this.eventService.deleteEvent(eventId, user);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}


@Roles(Role.Admin)  
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Put(':id/approve') 
@HttpCode(HttpStatus.OK)
async approveEvent(
  @Param('id') eventId: number,  
  @Request() req, 
) {
  const user = req.user; 

  try {
    return await this.eventService.approveEvent(eventId, user);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}


  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Put(':id/image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id') eventId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const imageUrl = await this.cloudinaryService.uploadImage(file);
      return await this.eventService.updateImage(eventId, imageUrl);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
