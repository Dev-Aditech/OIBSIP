const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST) {
    // Real SMTP account (set these in .env)
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } else {
    // Development: free fake inbox from Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  return transporter;
}

module.exports = async function sendEmail({ to, subject, html }) {
  const t = await getTransporter();
  const attachments = fs.existsSync(LOGO_PATH)
    ? [{ filename: 'logo.png', path: LOGO_PATH, cid: 'logo' }]
    : [];

  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || '"SliceCraft" <no-reply@slicecraft.com>',
    to,
    subject,
    html,
    attachments,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log('Email preview:', preview);
};
