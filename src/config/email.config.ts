import colors from 'colors';
import nodemailer, { Transporter } from 'nodemailer';
import config from './index';

let transporter: Transporter | null = null;
const initializeEmailTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(colors.cyan('📧 Email transporter initialized'));
  }

  return transporter;
};

// Get email transporter (lazy initialization)
const getEmailTransporter = (): Transporter => {
  if (!transporter) {
    return initializeEmailTransporter();
  }
  return transporter;
};

// Verify email transporter connection
const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const emailTransporter = getEmailTransporter();
    await emailTransporter.verify();

    console.log(colors.green('✅ Email server connected successfully'));
    console.log(colors.cyan(`   📧 email Host: ${config.email.host}`));
    console.log(colors.cyan(`   📧 email Port: ${config.email.port}`));
    console.log(colors.cyan(`   📧 From: ${config.email.emailFrom || config.email.username}`));

    return true;
  } catch (error: any) {
    console.error(colors.red('❌ Email server connection failed!'));
    console.error(colors.red(`   Error: ${error.message}`));
    console.log(colors.yellow('⚠️  Emails will not be sent until email is configured'));

    return false;
  }
};

export const emailConfig = {
  initializeEmailTransporter,
  getEmailTransporter,
  verifyEmailConnection,
};
