export interface IEmailService {
  sendWelcome(to: string, name: string): Promise<void>;
}
