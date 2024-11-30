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
import { Comment } from '@app/users/entities/comments.entity';
import { MailModule } from '@app/mail/mail.module';
import { MonitorInventarioGateway } from '../gateways/monitor-inventario/monitor-inventario.gateway'; // Importa el gateway

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Location, Event, Category, Comment]),
    MailModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    UserService,
    EventService,
    MonitorInventarioGateway,
  ], // Añade el gateway a los proveedores
  exports: [PaymentService],
})
export class PaymentModule {}
