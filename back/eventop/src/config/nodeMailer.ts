import * as dotenv from 'dotenv';
import { addSignature } from '../mail/emailHelper';
dotenv.config({
  path: '.env',
});

const nodemailer = require('nodemailer');

console.log(nodemailer); // Verifica el objeto nodemailer
console.log(nodemailer.createTransport); // Verifica si createTransport está disponible

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // o 465 para SSL
  secure: false, // Usa true si el puerto es 465
  auth: {
    user: process.env.EMAIL_USER, // Correo que envía los mensajes
    pass: process.env.EMAIL_PASS, // Contraseña del correo
  },
});

function generateEmailContent(title: string, body: string): string {
  return addSignature(`
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #7E3AF2; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">${title}</h1>
      </div>
      <div style="padding: 20px;">
        ${body}
      </div>
      <div style="background-color: #f4f4f4; color: #777; padding: 10px; text-align: center; font-size: 14px;">
        <p style="margin: 0;">© 2024 Eventop. Todos los derechos reservados.</p>
      </div>
    </div>
  `);
}

// Función para enviar correo de bienvenida
export const sendWelcomeEmail = async (email: string, name: string) => {
  const subject = '🎉 ¡Bienvenido a nuestra plataforma!';
  const body = `
    <p style="font-size: 16px;">¡Bienvenido a nuestra plataforma, ${name}!</p>
    <p style="font-size: 16px;">Estamos emocionados de tenerte con nosotros. Esperamos que disfrutes de la experiencia y encuentres todo lo que necesitas.</p>
    <p style="font-size: 16px;">¡Gracias por unirte!</p>
  `;
  const htmlContent = generateEmailContent(
    '¡Bienvenido a nuestra plataforma!',
    body,
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de bienvenida enviado a ${email}`);
  } catch (error) {
    console.error(`Error al enviar el correo de bienvenida a ${email}`, error);
  }
};

export async function sendApprovalEmail(
  email: string,
  name: string,
  eventName: string,
  eventId: number,
): Promise<void> {
  const subject = '🎉 ¡Tu evento ha sido aprobado!';
  const body = `
    <p style="font-size: 16px;">¡Hola ${name}!</p>
    <p style="font-size: 16px;">Nos complace informarte que tu evento "<strong>${eventName}</strong>" ha sido aprobado.</p>
    <p style="font-size: 16px;">Ya está disponible para el público en nuestra plataforma.</p>
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://eventop-frontend.vercel.app/events/${eventId}" 
         style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
        Ver mi evento
      </a>
    </p>
  `;
  const htmlContent = generateEmailContent('Tu evento ha sido aprobado', body);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de aprobación enviado a ${email}.`);
  } catch (error) {
    console.error(`Error al enviar el correo de aprobación a ${email}:`, error);
  }
}

export const sendPurchaseEmail = async (
  email: string,
  name: string,
  event: string,
  address: string,
  date,
  time,
) => {
  const ticketId = Math.floor(Math.random() * 1000000);
  const subject = '🎉 Confirmación de tu compra: ¡Gracias por elegirnos!';
  const body = `
    <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
    <p style="font-size: 16px;">Nos complace confirmar tu compra para el evento:</p>
    <p style="font-size: 18px; font-weight: bold; color: #4CAF50;">${event}</p>
    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="font-size: 16px;">Detalles del ticket:</p>
    <p style="font-size: 16px;"><strong>ID del Ticket:</strong> ${ticketId}</p>
    <p style="font-size: 16px;"><strong>Fecha:</strong> ${date} </p>
    <p style="font-size: 16px;"><strong>Horario:</strong> ${time}</p>
    <p style="font-size: 16px;"><strong>Ubicación:</strong> ${address}</p>
    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="font-size: 16px;">Para verificar que eres el propietario del ticket, recuerda llevar tu documento de identidad el día del evento. Esto nos ayudará a garantizar que todo transcurra sin inconvenientes.</p>
    <p style="font-size: 16px;">Si tienes alguna duda, no dudes en responder a este correo.</p>
    <p style="font-size: 16px;">¡Esperamos que disfrutes del evento!</p>
  `;
  const htmlContent = generateEmailContent('¡Gracias por tu compra!', body);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de agradecimiento enviado a ${email}`);
  } catch (error) {
    console.error(
      `Error al enviar el correo de agradecimiento a ${email}`,
      error,
    );
  }
};

export const notifyAdminsAboutEvent = async (
  adminsEmails: string[],
  clientName: string,
  eventName: string,
) => {
  const subject = '📢 Aprobación de Evento Requerida';
  const body = `
    <p style="font-size: 16px;">El usuario <strong>${clientName}</strong> ha creado un nuevo evento llamado: <strong>${eventName}</strong>.</p>
    <p style="font-size: 16px;">Por favor, revisa el evento y procede con su aprobación.</p>
    <p style="text-align: center; margin-top: 20px;">
      <a href="https://eventop-frontend.vercel.app/admin/events" 
         style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 4px;">
        Revisar Evento
      </a>
    </p>
  `;
  const htmlContent = generateEmailContent(
    'Notificación de Nuevo Evento',
    body,
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminsEmails,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Notificación enviada a los administradores: ${adminsEmails.join(', ')}`,
    );
  } catch (error) {
    console.error(
      `Error al enviar la notificación a los administradores`,
      error,
    );
  }
};

export const sendBanNotification = async (
  email: string,
  reason: string,
  permanent: boolean,
) => {
  const subject = permanent
    ? '🚫 Baneo Permanente de tu Cuenta'
    : '⚠️ Baneo Temporal de tu Cuenta';

  const body = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hola,</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Te informamos que tu cuenta ha sido <strong>${permanent ? 'permanentemente baneada' : 'temporalmente baneada'}</strong> debido a la siguiente razón:</p>
    <blockquote style="font-size: 14px; margin: 20px 0; padding: 12px; background-color: #f9f9f9; border-left: 4px solid ${permanent ? '#FF4D4D' : '#FFA726'};">
      ${reason}
    </blockquote>
    ${
      permanent
        ? `<p style="font-size: 16px; color: #FF4D4D;">Lamentamos informarte que no podrás volver a acceder a nuestra plataforma.</p>`
        : `<p style="font-size: 16px; color: #FFA726;">El baneo tiene una duración de <strong>30 días</strong>, tras lo cual podrás acceder nuevamente a nuestra plataforma.</p>`
    }
    <p style="font-size: 14px; margin-top: 20px; color: #555;">Si crees que este baneo es un error, por favor contacta a nuestro equipo de soporte respondiendo a este correo o visitando nuestro <a href="https://example.com/soporte" style="color: ${permanent ? '#FF4D4D' : '#FFA726'}; text-decoration: none;">centro de soporte</a>.</p>
  `;
  const htmlContent = generateEmailContent(
    permanent ? '🚫 Baneo Permanente' : '⚠️ Baneo Temporal',
    body,
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de notificación de baneo enviado a ${email}`);
  } catch (error) {
    console.error(
      `Error al enviar el correo de notificación de baneo a ${email}:`,
      error,
    );
  }
};

export const sendUnbanNotification = async (email: string) => {
  const subject = '🎉 ¡Tu cuenta ha sido reactivada!';
  const body = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hola,</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Nos alegra informarte que tu cuenta ha sido <strong>desbaneada</strong>. Ahora tienes acceso completo a todos los servicios de nuestra plataforma.</p>
    <p style="font-size: 14px; margin-bottom: 20px; color: #4CAF50;">Si tienes alguna consulta o necesitas asistencia, no dudes en contactarnos.</p>
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://eventop-frontend.vercel.app" 
         style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
        Iniciar sesión ahora
      </a>
    </p>
  `;
  const htmlContent = generateEmailContent(
    '🎉 ¡Tu cuenta ha sido reactivada!',
    body,
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de notificación de desbaneo enviado a ${email}`);
  } catch (error) {
    console.error(
      `Error al enviar el correo de notificación de desbaneo a ${email}:`,
      error,
    );
  }
};

export const sendPassword = async (email: string, password: string) => {
  const subject = '🔑 Recuperación de tu contraseña en Eventop';
  const body = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hola,</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Tu nueva contraseña temporal es: <strong>${password}</strong></p>
    <p style="font-size: 14px; margin-bottom: 20px; color: #d32f2f;">Te recomendamos cambiar esta contraseña lo antes posible desde tu perfil para mayor seguridad.</p>
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://eventop-frontend.vercel.app/login" 
         style="display: inline-block; padding: 12px 24px; background-color: #FF5722; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
        Cambiar mi contraseña
      </a>
    </p>
  `;
  const htmlContent = generateEmailContent(
    '🔑 Recuperación de contraseña',
    body,
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de recuperación de contraseña enviado a ${email}`);
  } catch (error) {
    console.error(
      `Error al enviar el correo de recuperación de contraseña a ${email}:`,
      error,
    );
  }
};

export const sendForgotPasswordEmail = async (
  email: string,
  newPassword: string,
) => {
  const subject = '🔒 Recuperación de Contraseña';
  const body = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hola,</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Hemos generado una nueva contraseña temporal para tu cuenta: <strong style="color: #FF5722;">${newPassword}</strong></p>
    <p style="font-size: 14px; margin-bottom: 20px; color: #d32f2f;">Por tu seguridad, te recomendamos cambiar esta contraseña en cuanto inicies sesión.</p>
    <p style="text-align: center; margin-top: 30px;">
      <a href="https://eventop-frontend.vercel.app/login" 
         style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
        Cambiar mi contraseña
      </a>
    </p>
  `;
  const htmlContent = generateEmailContent(
    '🔒 Recuperación de Contraseña',
    body,
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de recuperación de contraseña enviado a ${email}`);
  } catch (error) {
    console.error(
      `Error al enviar el correo de recuperación de contraseña a ${email}:`,
      error,
    );
  }
};
