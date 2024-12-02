import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    type: String,
    description: 'The old password of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    type: String,
    description: 'The new password of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
