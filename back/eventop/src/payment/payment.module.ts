import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { WebhookController } from './webhook.controller'; // Importa el nuevo controlador
import { User } from '@app/users/entities/users.entity';
import { UserService } from '@app/users/users.service';
import { EventService } from '@app/events/events.service';
import { Location } from '@app/locations/entities/locations.entity';
import { Event } from '@app/events/entities/events.entity';
import { Category } from '@app/categories/entities/categories.entity';
import { Comment } from '@app/users/entities/comments.entity';
import { MailModule } from '@app/mail/mail.module';
import { MonitorInventarioGateway } from '../gateways/monitor-inventario/monitor-inventario.gateway';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Location, Event, Category, Comment]),
    MailModule,
    UsersModule,
  ],
  controllers: [PaymentController, WebhookController], // Añade el nuevo controlador
  providers: [
    PaymentService,
    UserService,
    EventService,
    MonitorInventarioGateway,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
