import { addEmailToQueue } from '../queues/email.queue';

const generateProfessionalEmailTemplate = (
  content: string,
  options: { title: string; preheader?: string }
): string => {
  const { title, preheader = '' } = options;
  const logoUrl = 'https://res.cloudinary.com/dwddmg323/image/upload/v1770434490/logo_sddfri.png';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #F8FAFC;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1E293B;
      line-height: 1.6;
    }
    table { border-collapse: collapse; }

    .email-wrapper {
      background: #F8FAFC;
      padding: 40px 20px;
    }

    .container {
      max-width: 600px;
      margin: 30px 20px; 
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    }

    .logo-section {
      text-align: center;
      padding: 32px 20px;
      background: #FFFFFF;
    }

    .logo-section img {
      height: 48px;
      width: auto;
      display: inline-block;
    }

    .content {
      padding: 0 40px 40px;
      font-size: 16px;
      color: #334155;
    }

    .content h1, .content h2 {
      color: #0F172A;
      font-size: 24px;
      margin: 0 0 20px 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .content p {
      margin: 0 0 16px;
      color: #475569;
    }

    .otp-code {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #2456C4;
      text-align: center;
      padding: 24px;
      background: #F1F5F9;
      border-radius: 12px;
      margin: 24px 0;
      border: 1px solid #E2E8F0;
    }

    .highlight-box {
      background: #F1F5F9;
      padding: 24px;
      margin: 24px 0;
      border-radius: 12px;
      font-size: 15px;
    }

    .highlight-box strong {
        color: #0F172A;
    }

    .highlight-box ul {
      margin: 12px 0 0;
      padding-left: 20px;
    }

    .highlight-box li {
      margin-bottom: 8px;
      color: #475569;
    }

    .button {
      display: inline-block;
      background: #2456C4;
      color: #FFFFFF !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-pending {
      background: #FEF3C7;
      color: #92400E;
    }

    .badge-approved {
      background: #DCFCE7;
      color: #166534;
    }

    .status-approved {
        background: #DCFCE7;
        color: #166534;
    }

    .badge-rejected {
      background: #FEE2E2;
      color: #991B1B;
    }

    .status-rejected {
        background: #FEE2E2;
        color: #991B1B;
    }

    .footer {
      background: #FFFFFF;
      padding: 20px 40px;
      text-align: center;
      font-size: 14px;
      color: #64748B;
      border-top: 1px solid #F1F5F9;
    }
    .social-links {
      margin: 20px 0 24px;
    }

    .social-icon {
      display: inline-block;
      margin: 0 12px;
      text-decoration: none;
    }

    .social-icon img {
      width: 24px;
      height: 24px;
      margin-bottom: 0;
      opacity: 0.7;
    }

    .footer a {
      color: #2456C4;
      text-decoration: none;
    }

    @media (max-width: 600px) {
      .email-wrapper { padding: 20px 10px; }
      .content { padding: 0 24px 32px; }
      .logo-section { padding: 24px 20px; }
    }
  </style>
</head>
<body>
  ${
    preheader
      ? `<div style="display:none;font-size:1px;color:#f5f7fa;line-height:1px;max-height:0;overflow:hidden;">${preheader}</div>`
      : ''
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-wrapper">
    <tr>
      <td align="center">
        <table class="container" role="presentation">
          <!-- Logo -->
          <tr>
            <td class="logo-section">
              <img src="${logoUrl}" alt="YourCR Logo">
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <div class="social-links">
                <a href="https://facebook.com/yourcr" class="social-icon">
                  <img src="https://img.icons8.com/ios-filled/50/2456C4/facebook-new.png" alt="Facebook">
                </a>
                <a href="https://instagram.com/yourcr" class="social-icon">
                  <img src="https://img.icons8.com/ios-filled/50/2456C4/instagram-new.png" alt="Instagram">
                </a>
                <a href="https://linkedin.com/company/yourcr" class="social-icon">
                  <img src="https://img.icons8.com/ios-filled/50/2456C4/linkedin.png" alt="LinkedIn">
                </a>
              </div>

              <p style="margin: 0 0 8px;">
                <a href="https://yourcr.app">www.yourcr.app</a> | <a href="mailto:support@yourcr.app">support@yourcr.app</a>
              </p>
              <p style="margin: 0;">
                © ${new Date().getFullYear()} YourCR. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const generateOTPSection = (otp: string, minutes: number = 30) => `
  <p>Please enter the following verification code to proceed:</p>
  <div class="otp-code">${otp}</div>
  <p style="text-align: center; color: #718096; font-size: 13px;">This code will expire in ${minutes} minutes</p>
`;

const generateHighlightBox = (html: string) => `
  <div class="highlight-box">${html}</div>
`;

const generateButton = (text: string, url: string) => `
  <div style="text-align:center; margin:10px 0;">
    <a href="${url}" class="button" target="_blank">${text}</a>
  </div>
`;

// ──────────────────────────────────────────────
// Email Functions (all in English)
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const subject = 'Welcome to Your CR!';
  const content = `
    <h1>Welcome, ${name}!</h1>
    <p>You're now part of Your CR — the centralized platform for class representatives and students to manage everything in one place.</p>
    ${generateHighlightBox(`
      <p><strong>What you can do on Your CR:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>Share class notices, routines, and assignments</li>
        <li>Communicate quickly with students</li>
        <li>Track attendance and results</li>
        <li>Manage college/polytechnic/university events & group chats</li>
      </ul>
    `)}
    <p>Get started right away!</p>
    ${generateButton('Go to Dashboard', 'https://yourcr.app/dashboard')}
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Welcome to Your CR',
    preheader: `Hi ${name}, your class management journey starts now!`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendVerificationEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Verify Your Email – Your OTP Code';
  const content = `
    <p>Thank you for signing up! Please use the code below to verify your email address:</p>
    ${generateOTPSection(otp, 15)}
    <p style="color:var(--muted); font-size:14px;">If you didn’t request this, you can safely ignore this email.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Email Verification',
    preheader: `Your verification code: ${otp}`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendResetPasswordEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Password Reset Request – Your OTP Code';
  const content = `
    <p>You requested to reset your password. Use the OTP below to continue:</p>
    ${generateOTPSection(otp, 15)}
    <p style="color:var(--muted); font-size:14px;">If you didn’t request this, your password will remain unchanged.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Password Reset',
    preheader: `Your reset code: ${otp}`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  const subject = 'Your One-Time Password (OTP)';
  const content = `
    <h2>Your OTP Code</h2>
    <p>Use this code to proceed:</p>
    ${generateOTPSection(otp, 15)}
    <p style="color:var(--muted); font-size:14px;">If you didn’t request this code, please ignore this email.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Your OTP Code',
    preheader: `Your code: ${otp}`,
  });

  await addEmailToQueue({ to, subject, html });
};

// ──────────────────────────────────────────────
// CR Registration Emails
export const sendPendingCRRegistrationEmail = async (
  to: string,
  name: string,
  institutionName: string
): Promise<void> => {
  const subject = 'CR Registration Received – Pending Approval';
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for registering as a Class Representative for <strong>${institutionName}</strong>. Your registration is currently under review.</p>
    ${generateHighlightBox(`
      <p><strong>Registration Details:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>Institution: ${institutionName}</li>
        <li>Status: <span class="status-badge status-pending">Pending</span></li>
      </ul>
    `)}
    <p>You will receive another email once your registration is approved or rejected.</p>
    <p style="color: #6b7280; font-size: 14px;">This usually takes 1-2 business days.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'CR Registration Pending',
    preheader: `Your CR registration for ${institutionName} is under review`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendCRRegistrationApprovedEmail = async (
  to: string,
  name: string,
  institutionName: string
): Promise<void> => {
  const subject = 'Your CR Registration has been Approved! 🎉';
  const content = `
    <p>Congratulations <strong>${name}</strong>,</p>
    <p>Your Class Representative registration for <strong>${institutionName}</strong> has been <span class="status-badge status-approved">Approved</span>.</p>
    ${generateHighlightBox(`
      <p><strong>Next Steps:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>Your dashboard is now fully unlocked.</li>
        <li>You can now start managing your class students and notices.</li>
        <li>Access routines, assessments, and attendance modules.</li>
      </ul>
    `)}
    <p>Ready to lead your batch? Click below to get started.</p>
    ${generateButton('Go to Dashboard', 'https://yourcr.app/dashboard')}
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Registration Approved',
    preheader: `Your CR registration for ${institutionName} has been approved. Welcome aboard!`,
  });

  await addEmailToQueue({ to, subject, html });
};

export const sendCRRegistrationRejectedEmail = async (
  to: string,
  name: string,
  institutionName: string,
  reason?: string
): Promise<void> => {
  const subject = 'CR Registration Rejected – Action Required';
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>We regret to inform you that your Class Representative registration for <strong>${institutionName}</strong> has been <span class="status-badge status-rejected">Rejected</span>.</p>
    ${
      reason
        ? generateHighlightBox(`
      <p><strong>Reason for Rejection:</strong></p>
      <p style="margin-top: 8px; color: #991B1B; font-weight: 500;">${reason}</p>
    `)
        : ''
    }
    <p>If you wish to re-submit your registration with corrected information, please log in to your account and update your details.</p>
    ${generateButton('Update Registration', 'https://yourcr.app/cr-registration/complete')}
    <p style="color: #64748B; font-size: 14px; margin-top: 24px;">Need help? Reply to this email or contact support.</p>
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Registration Rejected',
    preheader: `Your CR registration for ${institutionName} was not approved.`,
  });

  await addEmailToQueue({ to, subject, html });
};

// ──────────────────────────────────────────────
// Student Created Email
export const sendStudentCreatedEmail = async (
  to: string,
  name: string,
  crName: string,
  institutionName: string,
  defaultPassword: string
): Promise<void> => {
  const subject = 'Welcome to YourCR – Account Created';
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your account has been created on YourCR by your Class Representative <strong>${crName}</strong> from <strong>${institutionName}</strong>. Your default password is <strong>${defaultPassword}</strong>. Please change your password after logging in.</p>
    ${generateHighlightBox(`
      <p><strong>What you can do:</strong></p>
      <ul style="padding-left:24px; margin:16px 0;">
        <li>View class notices and updates</li>
        <li>Access class schedules and routines</li>
        <li>Submit assessments and assignments</li>
        <li>Report issues to your CR</li>
      </ul>
    `)}
    <p>You can now log in and start using the platform.</p>
    ${generateButton('Log In to YourCR', 'https://yourcr.app/login')}
  `;

  const html = generateProfessionalEmailTemplate(content, {
    title: 'Welcome to YourCR',
    preheader: `Your account has been created by ${crName}`,
  });

  await addEmailToQueue({ to, subject, html });
};

// ──────────────────────────────────────────────
// Generic Notification Email Template
export const getNotificationEmailHtml = (title: string, message: string, type: string): string => {
  let badgeClass = 'status-badge';
  let typeLabel = type;

  // Map types to styles and labels
  switch (type) {
    case 'NOTICE':
      badgeClass += ' badge-pending'; // Yellow/Orange
      typeLabel = 'Notice';
      break;
    case 'ASSESSMENT':
      badgeClass += ' badge-rejected'; // Red (Urgent/Important)
      typeLabel = 'Assessment';
      break;
    case 'CLASS':
    case 'CLASS_UPDATE':
      badgeClass += ' badge-approved'; // Green
      typeLabel = 'Class Update';
      break;
    case 'ISSUE':
      badgeClass += ' badge-rejected';
      typeLabel = 'Issue Reported';
      break;
    default:
      badgeClass += ' badge-pending';
      typeLabel = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  const content = `
    <div style="margin-bottom: 24px;">
      <span class="${badgeClass}">${typeLabel}</span>
    </div>
    
    <p style="font-size: 18px; color: #334155; margin-bottom: 24px;">
        ${title}
    </p>

    ${generateHighlightBox(`
      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
    `)}
    
    <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
      Log in to your dashboard to view full details and take necessary actions.
    </p>
    
    ${generateButton('View Dashboard', 'https://yourcr.app/dashboard')}
  `;

  return generateProfessionalEmailTemplate(content, {
    title: title,
    preheader: message.substring(0, 150),
  });
};
