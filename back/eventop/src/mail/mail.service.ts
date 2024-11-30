import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBanNotification(email: string, reason: string, permanent: boolean) {
    const subject = permanent ? 'Baneo permanente' : 'Baneo temporal';
    const text = `Has sido baneado por la siguiente razón: ${reason}. ${permanent ? 'El baneo es permanente.' : 'El baneo durará 30 días.'}`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      text,
    });
  }

  async sendUnbanNotification(email: string) {
    const subject = 'Desbaneo';
    const text = `Tu cuenta ha sido desbaneada. Ahora puedes acceder a todos los servicios de la plataforma.`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      text,
    });
  }

  async sendPassword(email: string, password: string) {
    const subject = 'Tu contraseña de eventop';
    const text = `Tu nueva contraseña es: ${password}. Recuerda cambiarla en tu perfil.`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      text,
    });
  }
}
