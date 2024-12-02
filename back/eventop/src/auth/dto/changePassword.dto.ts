import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    type: String,
    description: 'The old password of the user',
    required: true,
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    type: String,
    description: 'The new password of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/, {
    message:
      'La contraseña debe tener al menos una minúscula, una mayúscula, un numero y un carácter especial',
  })
  newPassword: string;
}
