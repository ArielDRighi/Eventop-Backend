import { Injectable } from '@nestjs/common';
import { addSignature } from './emailHelper';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBanNotification(email: string, reason: string, permanent: boolean) {
    const subject = permanent ? 'Baneo permanente' : 'Baneo temporal';
    const htmlContent = addSignature(
      `Has sido baneado por la siguiente razón: ${reason}. ${permanent ? 'El baneo es permanente.' : 'El baneo durará 30 días.'}`,
    );

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: htmlContent,
    });
  }

  async sendUnbanNotification(email: string) {
    const subject = 'Desbaneo';
    const htmlContent = addSignature(
      `Tu cuenta ha sido desbaneada. Ahora puedes acceder a todos los servicios de la plataforma.`,
    );

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: htmlContent,
    });
  }

  async sendPassword(email: string, password: string) {
    const subject = 'Tu contraseña de eventop';
    const htmlContent = addSignature(
      `Tu nueva contraseña es: ${password}. Recuerda cambiarla en tu perfil.`,
    );

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: htmlContent,
    });
  }

  sendForgotPasswordEmail(email: string, newPassword: string) {
    const subject = 'Recuperación de contraseña';
    const htmlContent = addSignature(
      `Tu nueva contraseña es: ${newPassword}. Recuerda cambiarla en tu perfil.`,
    );

    return this.mailerService.sendMail({
      to: email,
      subject,
      html: htmlContent,
    });
  }
}
