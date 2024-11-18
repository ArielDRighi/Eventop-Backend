import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaymentDto {
  @ApiProperty({
    type: Number,
    description: 'The ID of the event',
    required: true,
  })
  @IsNumber()
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
}
