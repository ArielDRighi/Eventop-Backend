import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const corsOptions: CorsOptions = {
    origin: [
      'https://eventop-frontend.vercel.app', // URL de producción
      'https://eventop-frontend-6zhm7o77f-ariel-righis-projects.vercel.app',
      'http://localhost:3000/',
    ],
    methods: ['GET', 'POST', 'PUT', 'FETCH', 'DELETE'],
    credentials: true,
  };

  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle('Eventop')
    .setDescription('PF Soy Henry Grupo 1')
    .setVersion('1.0')
    .addTag('eventop')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
