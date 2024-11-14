import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    type: String,
    description: 'The name of the city',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    type: String,
    description: 'The name of the state',
    required: true,
  })
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty({
    type: String,
    description: 'The name of the country',
    required: true,
  })
  @IsString()
  @IsOptional()
  country: string;

  @ApiProperty({
    type: String,
    description: 'The name of the address',
    required: true,
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({
    type: Number,
    description: 'The latitude of the location',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    type: Number,
    description: 'The longitude of the location',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
