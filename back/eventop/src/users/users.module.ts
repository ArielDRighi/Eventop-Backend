// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa TypeOrmModule
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User } from './entities/users.entity'; // Asegúrate de que esté en la ruta correcta
import { CloudinaryService } from '@app/events/cloudinary.service';
import { Comment } from './entities/comments.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Comment]), MailModule], // Registra UserRepository con TypeOrmModule
  providers: [UserService, CloudinaryService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
