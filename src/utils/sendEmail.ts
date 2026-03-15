import { StatusCodes } from 'http-status-codes';
import { emailConfig } from '../config/email.config';
import ApiError from './ApiError';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = emailConfig.getEmailTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USERNAME,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Email sending failed: ${error}`);
  }
};
