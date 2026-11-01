const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('./sendEmail');
const { emailLayout, escapeHtml } = require('./emailTemplate');
const Setting = require('../models/Setting');

let running = false;

async function checkLowStock() {
  if (running) return; // don't start a second check while one is in progress
  running = true;
  try {
    const settings = await Setting.get();
    if (!settings.lowStockEnabled) return; // switched off in Admin > Settings

    const low = await Inventory.find({
      $expr: { $lt: ['$quantity', '$threshold'] },
      lowStockAlertSent: false,
    }).sort({ category: 1, name: 1 });

    if (low.length === 0) return;

    const cell = 'padding:10px 12px;border-bottom:1px solid #e7e5e4;font-size:13px;';
    const rows = low
      .map(
        (i) => `<tr>
          <td style="${cell}font-weight:bold;">${escapeHtml(i.name)}</td>
          <td style="${cell}color:#78716c;">${escapeHtml(i.category)}</td>
          <td style="${cell}color:#dc2626;font-weight:bold;">${i.quantity}</td>
          <td style="${cell}">${i.threshold}</td>
        </tr>`
      )
      .join('');

    const head = 'padding:10px 12px;background:#fafaf9;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#78716c;text-align:left;';
    const content = `
      <p style="margin:0 0 16px;">${low.length} ingredient(s) have fallen below their stock threshold and need restocking:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e5e4;border-radius:8px;">
        <tr>
          <th style="${head}">Item</th><th style="${head}">Category</th><th style="${head}">In stock</th><th style="${head}">Threshold</th>
        </tr>
        ${rows}
      </table>`;

    await sendEmail({
      to: settings.alertEmail || process.env.ADMIN_EMAIL,
      subject: `Low stock alert: ${low.length} item(s) need restocking`,
      html: emailLayout({
        title: 'Low stock alert',
        preheader: `${low.length} item(s) are below their threshold`,
        content,
        buttonText: 'Open admin panel',
        buttonUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/login`,
      }),
    });

    // Mark as alerted only after the email went out
    await Inventory.updateMany({ _id: { $in: low.map((i) => i._id) } }, { lowStockAlertSent: true });
    console.log(`Low stock alert sent for ${low.length} item(s)`);
  } finally {
    running = false;
  }
}

function startLowStockJob() {
  let schedule = process.env.LOW_STOCK_CRON || '* * * * *'; // default: every minute
  if (!cron.validate(schedule)) {
    console.warn(`Invalid LOW_STOCK_CRON "${schedule}", using every minute`);
    schedule = '* * * * *';
  }
  cron.schedule(schedule, () => {
    checkLowStock().catch((err) => console.error('Low stock check failed:', err.message));
  });
  console.log(`Low stock job scheduled (${schedule})`);
}

module.exports = { checkLowStock, startLowStockJob };