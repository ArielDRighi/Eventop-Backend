import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    type: String,
    description: 'The name of the category',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'The description of the category',
    required: true,
  })
  @IsString()
  description: string;
}
