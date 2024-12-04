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

// Función para enviar correo de bienvenida
export const sendWelcomeEmail = async (email: string, name: string) => {
  const asunto = '¡Bienvenido a nuestra plataforma!';
  const htmlContent = addSignature(`
    <h1>¡Bienvenido a nuestra plataforma, ${name}!</h1>
    <p>Estamos emocionados de tenerte con nosotros. Esperamos que disfrutes de la experiencia y encuentres todo lo que necesitas.</p>
    <p>¡Gracias por unirte!</p>
  `);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: asunto,
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
): Promise<void> {
  const subject = 'Tu evento ha sido aprobado';
  const htmlContent = addSignature(`
    <h1>¡Hola ${name}!</h1>
    <p>Nos complace informarte que tu evento "<strong>${eventName}</strong>" ha sido aprobado.</p>
    <p>Ya está disponible para el público en nuestra plataforma.</p>
  `);

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
) => {
  const asunto = 'Gracias por tu compra';
  const htmlContent = addSignature(`
    <h1>¡Gracias por tu compra, ${name}!</h1>
    <p>Estamos encantados de que hayas adquirido el evento: <strong>${event}</strong>.</p>
    <p>Esperamos que disfrutes del evento.</p>
  `);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: asunto,
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
  const subject = 'Aprobación de Evento Requerida';
  const htmlContent = addSignature(`
    <h1>Notificación de Nuevo Evento</h1>
    <p>El usuario <strong>${clientName}</strong> ha creado un nuevo evento llamado: <strong>${eventName}</strong>.</p>
    <p>Por favor, revisa el evento y procede con su aprobación.</p>
  `);

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
