import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    type: String,
    description: 'The name of user',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: String,
    description: 'The email of user',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    type: String,
    description: 'The password of user',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    type: String,
    description: 'The language of user',
    required: false,
  })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @ApiProperty({
    type: String,
    description: 'The currency of user',
    required: false,
  })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @ApiProperty({
    type: String,
    description: 'The image URL of user',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
