const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('./sendEmail');

let running = false;

async function checkLowStock() {
  if (running) return; // don't start a second check while one is in progress
  running = true;
  try {
    const low = await Inventory.find({
      $expr: { $lt: ['$quantity', '$threshold'] },
      lowStockAlertSent: false,
    }).sort({ category: 1, name: 1 });

    if (low.length === 0) return;

    const rows = low
      .map(
        (i) =>
          `<tr><td>${i.name}</td><td>${i.category}</td><td>${i.quantity}</td><td>${i.threshold}</td></tr>`
      )
      .join('');

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Low stock alert: ${low.length} item(s) need restocking`,
      html: `<h3>Low stock alert</h3>
             <p>These items have fallen below their threshold:</p>
             <table border="1" cellpadding="6" cellspacing="0">
               <tr><th>Item</th><th>Category</th><th>In stock</th><th>Threshold</th></tr>
               ${rows}
             </table>`,
    });

    // Mark as alerted only after the email went out
    await Inventory.updateMany(
      { _id: { $in: low.map((i) => i._id) } },
      { lowStockAlertSent: true }
    );
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