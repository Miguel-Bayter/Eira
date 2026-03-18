import { Resend } from 'resend';
import type { IEmailService } from '@application/ports/IEmailService';

export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.resend.emails.send({
      from: 'Eira <noreply@eira.app>',
      to,
      subject: '🌿 Bienvenido/a a Eira',
      html: `
        <h1>Hola ${name} 👋</h1>
        <p>Bienvenido/a a <strong>Eira</strong>, tu espacio de bienestar mental.</p>
        <p>Estamos aquí para acompañarte en tu camino.</p>
        <br>
        <p>Con cariño,<br>El equipo de Eira 🌿</p>
      `,
    });
  }
}
