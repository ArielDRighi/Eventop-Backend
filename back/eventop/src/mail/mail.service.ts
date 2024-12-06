// import { Injectable } from '@nestjs/common';
// import { addSignature } from './emailHelper';
// import { MailerService } from '@nestjs-modules/mailer';

// @Injectable()
// export class MailService {
//   constructor(private readonly mailerService: MailerService) {}

//   async sendBanNotification(email: string, reason: string, permanent: boolean) {
//     const subject = permanent
//       ? '🚫 Baneo Permanente de tu Cuenta'
//       : '⚠️ Baneo Temporal de tu Cuenta';

//     const htmlContent = addSignature(`
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
//         <div style="background-color: ${permanent ? '#FF4D4D' : '#FFA726'}; color: white; padding: 16px; text-align: center;">
//           <h1 style="margin: 0;">${permanent ? '🚫 Baneo Permanente' : '⚠️ Baneo Temporal'}</h1>
//         </div>
//         <div style="padding: 20px;">
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Hola,
//           </p>
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Te informamos que tu cuenta ha sido <strong>${permanent ? 'permanentemente baneada' : 'temporalmente baneada'}</strong> debido a la siguiente razón:
//           </p>
//           <blockquote style="font-size: 14px; margin: 20px 0; padding: 12px; background-color: #f9f9f9; border-left: 4px solid ${permanent ? '#FF4D4D' : '#FFA726'};">
//             ${reason}
//           </blockquote>
//           ${
//             permanent
//               ? `<p style="font-size: 16px; color: #FF4D4D;">Lamentamos informarte que no podrás volver a acceder a nuestra plataforma.</p>`
//               : `<p style="font-size: 16px; color: #FFA726;">El baneo tiene una duración de <strong>30 días</strong>, tras lo cual podrás acceder nuevamente a nuestra plataforma.</p>`
//           }
//           <p style="font-size: 14px; margin-top: 20px; color: #555;">
//             Si crees que este baneo es un error, por favor contacta a nuestro equipo de soporte respondiendo a este correo o visitando nuestro <a href="https://example.com/soporte" style="color: ${permanent ? '#FF4D4D' : '#FFA726'}; text-decoration: none;">centro de soporte</a>.
//           </p>
//         </div>
//         <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #888;">
//           Este es un correo automático. Por favor, no respondas directamente a este mensaje.
//         </div>
//       </div>
//     `);

//     try {
//       await this.mailerService.sendMail({
//         to: email,
//         subject,
//         html: htmlContent,
//       });
//       console.log(`Correo de notificación de baneo enviado a ${email}`);
//     } catch (error) {
//       console.error(
//         `Error al enviar el correo de notificación de baneo a ${email}:`,
//         error,
//       );
//     }
//   }

//   async sendUnbanNotification(email: string) {
//     const subject = '🎉 ¡Tu cuenta ha sido reactivada!';

//     const htmlContent = addSignature(`
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
//         <div style="background-color: #4CAF50; color: white; padding: 16px; text-align: center;">
//           <h1 style="margin: 0;">🎉 ¡Tu cuenta ha sido reactivada!</h1>
//         </div>
//         <div style="padding: 20px;">
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Hola,
//           </p>
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Nos alegra informarte que tu cuenta ha sido <strong>desbaneada</strong>. Ahora tienes acceso completo a todos los servicios de nuestra plataforma.
//           </p>
//           <p style="font-size: 14px; margin-bottom: 20px; color: #4CAF50;">
//             Si tienes alguna consulta o necesitas asistencia, no dudes en contactarnos.
//           </p>
//           <p style="text-align: center; margin-top: 30px;">
//             <a href="https://example.com/inicio-sesion"
//                style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
//               Iniciar sesión ahora
//             </a>
//           </p>
//         </div>
//         <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #888;">
//           Si tienes preguntas, puedes responder este correo o visitar nuestro <a href="https://example.com/soporte" style="color: #4CAF50; text-decoration: none;">centro de soporte</a>.
//         </div>
//       </div>
//     `);

//     try {
//       await this.mailerService.sendMail({
//         to: email,
//         subject,
//         html: htmlContent,
//       });
//       console.log(`Correo de notificación de desbaneo enviado a ${email}`);
//     } catch (error) {
//       console.error(
//         `Error al enviar el correo de notificación de desbaneo a ${email}:`,
//         error,
//       );
//     }
//   }

//   async sendPassword(email: string, password: string) {
//     const subject = '🔑 Recuperación de tu contraseña en Eventop';

//     const htmlContent = addSignature(`
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
//         <div style="background-color: #FF5722; color: #fff; padding: 16px; text-align: center;">
//           <h1 style="margin: 0;">🔑 Recuperación de contraseña</h1>
//         </div>
//         <div style="padding: 20px;">
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Hola,
//           </p>
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Tu nueva contraseña temporal es: <strong>${password}</strong>
//           </p>
//           <p style="font-size: 14px; margin-bottom: 20px; color: #d32f2f;">
//             Te recomendamos cambiar esta contraseña lo antes posible desde tu perfil para mayor seguridad.
//           </p>
//           <p style="text-align: center; margin-top: 30px;">
//             <a href="https://eventop.com/mi-perfil"
//                style="display: inline-block; padding: 12px 24px; background-color: #FF5722; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
//               Cambiar mi contraseña
//             </a>
//           </p>
//         </div>
//         <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #888;">
//           Si no solicitaste este cambio, por favor contacta a nuestro equipo de soporte.
//         </div>
//       </div>
//     `);

//     try {
//       await this.mailerService.sendMail({
//         to: email,
//         subject,
//         html: htmlContent,
//       });
//       console.log(`Correo de recuperación de contraseña enviado a ${email}`);
//     } catch (error) {
//       console.error(
//         `Error al enviar el correo de recuperación de contraseña a ${email}:`,
//         error,
//       );
//     }
//   }

//   async sendForgotPasswordEmail(email: string, newPassword: string) {
//     const subject = '🔒 Recuperación de Contraseña';

//     const htmlContent = addSignature(`
//       <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
//         <div style="background-color: #2196F3; color: white; padding: 16px; text-align: center;">
//           <h1 style="margin: 0;">🔒 Recuperación de Contraseña</h1>
//         </div>
//         <div style="padding: 20px;">
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Hola,
//           </p>
//           <p style="font-size: 16px; margin-bottom: 20px;">
//             Hemos generado una nueva contraseña temporal para tu cuenta:
//             <strong style="color: #FF5722;">${newPassword}</strong>
//           </p>
//           <p style="font-size: 14px; margin-bottom: 20px; color: #d32f2f;">
//             Por tu seguridad, te recomendamos cambiar esta contraseña en cuanto inicies sesión.
//           </p>
//           <p style="text-align: center; margin-top: 30px;">
//             <a href="https://example.com/mi-perfil"
//                style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
//               Cambiar mi contraseña
//             </a>
//           </p>
//         </div>
//         <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #888;">
//           Si no solicitaste este cambio, por favor ignora este correo o contacta a nuestro equipo de soporte.
//         </div>
//       </div>
//     `);

//     try {
//       await this.mailerService.sendMail({
//         to: email,
//         subject,
//         html: htmlContent,
//       });
//       console.log(`Correo de recuperación de contraseña enviado a ${email}`);
//     } catch (error) {
//       console.error(
//         `Error al enviar el correo de recuperación de contraseña a ${email}:`,
//         error,
//       );
//     }
//   }
// }
