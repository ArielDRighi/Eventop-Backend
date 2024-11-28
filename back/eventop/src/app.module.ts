import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import TypeOrmConfig from './config/typeorm';
import { PaymentModule } from './payment/payment.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MonitorInventarioGateway } from './gateways/monitor-inventario/monitor-inventario.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [TypeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('EMAIL_USER')}>`,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    CategoriesModule,
    LocationsModule,
    PaymentModule,
    MailModule,
  ],
  controllers: [],
  providers: [MonitorInventarioGateway],
})
export class AppModule {}
