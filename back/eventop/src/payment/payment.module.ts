import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { User } from '@app/users/entities/users.entity';
import { UserService } from '@app/users/users.service';
import { EventService } from '@app/events/events.service';
import { Location } from '@app/locations/entities/locations.entity';
import { Event } from '@app/events/entities/events.entity';
import { Category } from '@app/categories/entities/categories.entity';
import { MailModule } from '@app/mail/mail.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Location, Event, Category]),
    MailModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, UserService, EventService],
  exports: [PaymentService],
})
export class PaymentModule {}
