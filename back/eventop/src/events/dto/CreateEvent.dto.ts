import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    type: String,
    description: 'The name of the event',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'The description of the event',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    type: Date,
    description: 'The date of the event',
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    type: Number,
    description: 'The price of the event',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    type: Number,
    description: 'The category of the event',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @ApiProperty({
    type: Number,
    description: 'The location of the event',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  location_id: number;

  @ApiProperty({
    type: String,
    description: 'The currency of the event',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    type: String,
    description: 'The image URL of the event',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    type: Number,
    description: 'The quantity of tickets available',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  quantityAvailable: number;
}
