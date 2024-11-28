// src/users/dto/ban-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning the user',
    example: 'Violación de las reglas de la comunidad',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Indicates if the ban is permanent',
    example: false,
  })
  @IsBoolean()
  permanent: boolean;
}
