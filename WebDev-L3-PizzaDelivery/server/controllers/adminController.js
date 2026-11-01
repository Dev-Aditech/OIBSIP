const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Setting = require('../models/Setting');
const Address = require('../models/Address');
const SavedPizza = require('../models/SavedPizza');
const sendEmail = require('../utils/sendEmail');
const { emailLayout } = require('../utils/emailTemplate');
const { parseDuration } = require('../utils/duration');
const { invalidateUser } = require('../utils/authCache');

const fail = (res, err) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};

// ---------- Customers ----------
exports.getCustomers = async (req, res) => {
  try {
    const [users, stats] = await Promise.all([
      User.find({ role: 'user' })
        .select('name email isVerified createdAt suspendedUntil suspensionReason')
        .sort({ createdAt: -1 })
        .lean(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$totalPrice' }, lastOrderAt: { $max: '$createdAt' } } },
      ]),
    ]);
    const byUser = new Map(stats.map((s) => [String(s._id), s]));
    const now = Date.now();

    res.json(
      users.map((u) => {
        const s = byUser.get(String(u._id));
        return {
          ...u,
          suspended: Boolean(u.suspendedUntil && new Date(u.suspendedUntil).getTime() > now),
          orders: s?.orders ?? 0,
          spent: s?.spent ?? 0,
          lastOrderAt: s?.lastOrderAt ?? null,
        };
      })
    );
  } catch (err) {
    fail(res, err);
  }
};

// Finds a customer (never an admin) from the :id in the URL
async function findCustomer(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: 'Invalid customer id' });
    return null;
  }
  const user = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!user) {
    res.status(404).json({ message: 'Customer not found' });
    return null;
  }
  return user;
}

exports.suspendCustomer = async (req, res) => {
  try {
    const { ms, error } = parseDuration(req.body.amount, req.body.unit);
    if (error) return res.status(400).json({ message: error });

    const user = await findCustomer(req, res);
    if (!user) return;

    user.suspendedUntil = new Date(Date.now() + ms);
    user.suspensionReason = String(req.body.reason ?? '').trim().slice(0, 200);
    await user.save();
    invalidateUser(user._id); // takes effect on their very next request

    res.json({ message: 'Customer suspended', suspendedUntil: user.suspendedUntil });
  } catch (err) {
    fail(res, err);
  }
};

exports.unsuspendCustomer = async (req, res) => {
  try {
    const user = await findCustomer(req, res);
    if (!user) return;

    user.suspendedUntil = null;
    user.suspensionReason = '';
    await user.save();
    invalidateUser(user._id);

    res.json({ message: 'Suspension lifted' });
  } catch (err) {
    fail(res, err);
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const user = await findCustomer(req, res);
    if (!user) return;

    // Never delete someone while their pizza is still being made or delivered
    const active = await Order.countDocuments({
      user: user._id,
      paymentStatus: 'paid',
      status: { $ne: 'Sent to Delivery' },
    });
    if (active > 0) {
      return res.status(409).json({
        message: `${user.name} has ${active} order(s) in progress. Finish them first, or suspend the account instead.`,
      });
    }

    // Personal data goes. Paid orders stay for your sales records; unpaid and failed ones are removed.
    await Address.deleteMany({ user: user._id });
    await SavedPizza.deleteMany({ user: user._id });
    await Order.deleteMany({ user: user._id, paymentStatus: { $ne: 'paid' } });
    await user.deleteOne();
    invalidateUser(user._id);

    res.json({ message: 'Customer deleted' });
  } catch (err) {
    fail(res, err);
  }
};

// ---------- Reports ----------
exports.getReports = async (req, res) => {
  try {
    const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));
    const match = { paymentStatus: 'paid', createdAt: { $gte: since } };

    const [daily, top, byStatus] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        { $group: { _id: { name: '$items.name', category: '$items.category' }, count: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Order.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    // One entry per day, including days with no orders
    const byDay = new Map(daily.map((d) => [d._id, d]));
    const series = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(since);
      day.setUTCDate(since.getUTCDate() + i);
      const key = day.toISOString().slice(0, 10);
      series.push({ date: key, revenue: byDay.get(key)?.revenue ?? 0, orders: byDay.get(key)?.orders ?? 0 });
    }

    const revenue = series.reduce((sum, d) => sum + d.revenue, 0);
    const orders = series.reduce((sum, d) => sum + d.orders, 0);

    res.json({
      days,
      revenue,
      orders,
      averageOrder: orders ? Math.round(revenue / orders) : 0,
      series,
      topIngredients: top.map((t) => ({ name: t._id.name, category: t._id.category, count: t.count })),
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    });
  } catch (err) {
    fail(res, err);
  }
};

// ---------- Settings ----------
const shape = (s) => ({
  alertEmail: s.alertEmail || process.env.ADMIN_EMAIL || '',
  lowStockEnabled: s.lowStockEnabled,
  defaultThreshold: s.defaultThreshold,
});

exports.getSettings = async (req, res) => {
  try {
    res.json(shape(await Setting.get()));
  } catch (err) {
    fail(res, err);
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const email = String(req.body.alertEmail ?? '').trim().toLowerCase();
    const threshold = Number(req.body.defaultThreshold);

    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid alert email' });
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100000) {
      return res.status(400).json({ message: 'Threshold must be a whole number from 0 to 100000' });
    }

    const settings = await Setting.get();
    settings.alertEmail = email;
    settings.lowStockEnabled = Boolean(req.body.lowStockEnabled);
    settings.defaultThreshold = threshold;
    await settings.save();
    res.json(shape(settings));
  } catch (err) {
    fail(res, err);
  }
};

exports.applyThreshold = async (req, res) => {
  try {
    const threshold = Number(req.body.threshold);
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100000) {
      return res.status(400).json({ message: 'Threshold must be a whole number from 0 to 100000' });
    }

    const result = await Inventory.updateMany({}, { threshold });
    // Items now at or above their threshold can alert again later
    await Inventory.updateMany({ $expr: { $gte: ['$quantity', '$threshold'] } }, { lowStockAlertSent: false });
    res.json({ updated: result.modifiedCount });
  } catch (err) {
    fail(res, err);
  }
};

exports.sendTestEmail = async (req, res) => {
  try {
    const settings = await Setting.get();
    const to = settings.alertEmail || process.env.ADMIN_EMAIL;
    await sendEmail({
      to,
      subject: 'SliceCraft test email',
      html: emailLayout({
        title: 'Test email',
        preheader: 'Your alert emails are working',
        content: '<p style="margin:0;">If you can read this, low-stock alerts will reach this inbox.</p>',
      }),
    });
    res.json({ message: `Test email sent to ${to}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Could not send the email: ${err.message}` });
  }
};