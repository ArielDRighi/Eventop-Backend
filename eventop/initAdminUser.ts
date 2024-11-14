import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { UserService } from '@app/users/users.service';
import { CreateUserDto } from '@app/auth/dto/createUser.dto';
import { Role } from '@app/auth/enum/roles.enum';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  const configService = app.get(ConfigService);

  const adminEmail = configService.get<string>('ADMIN_EMAIL');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');

  if (!adminEmail || !adminPassword) {
    console.error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment variables',
    );
    process.exit(1);
  }

  const existingAdmin = await userService.findOneByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser: CreateUserDto = {
      email: adminEmail,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      name: 'Admin',
      role: Role.Admin,
    };
    await userService.createUser(adminUser);
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }

  await app.close();
}

bootstrap();
