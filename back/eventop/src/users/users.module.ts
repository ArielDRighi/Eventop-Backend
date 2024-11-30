import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User } from './entities/users.entity';
import { CloudinaryService } from '@app/events/cloudinary.service';
import { Comment } from './entities/comments.entity';
import { MailModule } from '../mail/mail.module';
import { BannedEmail } from './entities/banned-email.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Comment, BannedEmail]), MailModule],
  providers: [UserService, CloudinaryService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UsersModule {}
