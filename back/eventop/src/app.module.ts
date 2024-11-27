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
import { MonitorInventarioGateway } from './gateways/monitor-inventario/monitor-inventario.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [TypeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) =>
        ConfigService.get('typeorm'),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    CategoriesModule,
    LocationsModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [MonitorInventarioGateway],
})
export class AppModule {}
