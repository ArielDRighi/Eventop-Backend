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
    description: 'The name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'The email of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    description: 'The password of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
    description: 'The confirm password of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
