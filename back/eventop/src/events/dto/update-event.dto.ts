import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({
    type: String,
    description: 'The name of the event',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: String,
    description: 'The description of the event',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: Date,
    description: 'The date of the event',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    type: String,
    description: 'The time of the event',
    required: true,
  })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({
    type: Number,
    description: 'The price of the event',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    type: String,
    description: 'The categoryId of the event',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    type: String,
    description: 'The locationId of the event',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  locationId?: number;

  @ApiProperty({
    type: Number,
    description: 'The quantity of tickets available',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  quantityTotal?: number;

  @ApiProperty({
    default: false,
  })
  @IsBoolean()
  @Transform(({ value }) => (value === undefined ? false : value), {
    toClassOnly: true,
  })
  @IsOptional()
  approved?: boolean;
}
