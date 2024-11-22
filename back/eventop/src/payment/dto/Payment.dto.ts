import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaymentDto {
  @ApiProperty({
    type: String,
    description: 'The ID of the event',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  eventId: number;

  @ApiProperty({
    type: String,
    description: 'The email of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: Number,
    description: 'The quantity of the tickets',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
