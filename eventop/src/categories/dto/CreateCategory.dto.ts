import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    description: 'The name of the category',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
