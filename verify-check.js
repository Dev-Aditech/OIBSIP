const base = 'http://localhost:5000/api';
const mongoose = require('mongoose');
require('dotenv').config({ path: 'C:/Users/PC/Desktop/OIBSIP/WebDev-L3-PizzaDelivery/server/.env' });

const fetchJson = async (path, opts = {}) => {
  const res = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { ok: res.ok, status: res.status, data };
};

function log(label, value) {
  console.log(label + ':', JSON.stringify(value));
}

(async () => {
  const email = `qa_${Date.now()}@example.com`;
  const password = 'Pass1234!';

  const reg = await fetchJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'QA User', email, password }),
  });
  log('register', { ok: reg.ok, status: reg.status, ...reg.data });

  // verify email through Mongo before login, since users must confirm before using the app
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./server/models/User');
  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw new Error('User not created');
  }
  const verifyRes = await fetchJson(`/auth/verify/${user.verificationToken}`);
  log('verify', { ok: verifyRes.ok, status: verifyRes.status, data: verifyRes.data });
  await mongoose.disconnect();

  const login = await fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  log('login', { ok: login.ok, status: login.status, token: !!login.data?.token, user: login.data?.user });
  if (!login.data?.token) return;
  const token = login.data.token;

  const inventory = await fetchJson('/inventory', { headers: { Authorization: `Bearer ${token}` } });
  log('inventory', { ok: inventory.ok, status: inventory.status, count: inventory.data?.length || 0 });
  const baseId = inventory.data.find((i) => i.category === 'base')._id;
  const sauceId = inventory.data.find((i) => i.category === 'sauce')._id;
  const cheeseId = inventory.data.find((i) => i.category === 'cheese')._id;
  const veggieIds = inventory.data.filter((i) => i.category === 'veggie').slice(0, 2).map((i) => i._id);

  const add1 = await fetchJson('/addresses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ label: 'Home', line: '1 Main St', city: 'Bengaluru', phone: '+919876543210' }),
  });
  log('add1', { ok: add1.ok, status: add1.status, default: add1.data?.isDefault, id: add1.data?._id });

  const add2 = await fetchJson('/addresses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ label: 'Work', line: '2 Park Ave', city: 'Bengaluru', phone: '+919876543211' }),
  });
  log('add2', { ok: add2.ok, status: add2.status, default: add2.data?.isDefault, id: add2.data?._id });

  const listBefore = await fetchJson('/addresses', { headers: { Authorization: `Bearer ${token}` } });
  log('listBefore', listBefore.data?.map((a) => ({ id: a._id, label: a.label, isDefault: a.isDefault })));

  const secondId = listBefore.data[1]._id;
  const setDefault = await fetchJson(`/addresses/${secondId}/default`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  log('setDefault', { ok: setDefault.ok, status: setDefault.status, default: setDefault.data?.isDefault });

  const listAfterDefault = await fetchJson('/addresses', { headers: { Authorization: `Bearer ${token}` } });
  log('listAfterDefault', listAfterDefault.data?.map((a) => ({ id: a._id, label: a.label, isDefault: a.isDefault })));

  const firstId = listAfterDefault.data.find((a) => a.label === 'Home')._id;
  const removeFirst = await fetchJson(`/addresses/${firstId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  log('removeFirst', { ok: removeFirst.ok, status: removeFirst.status, message: removeFirst.data?.message });

  const finalAddresses = await fetchJson('/addresses', { headers: { Authorization: `Bearer ${token}` } });
  log('finalAddresses', finalAddresses.data?.map((a) => ({ id: a._id, label: a.label, isDefault: a.isDefault })));

  const summary = await fetchJson('/orders/summary', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ baseId, sauceId, cheeseId, veggieIds, quantity: 1 }),
  });
  log('summary', { ok: summary.ok, status: summary.status, total: summary.data?.totalPrice, items: summary.data?.items?.map((i) => i.name) });

  const createOrder = await fetchJson('/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ baseId, sauceId, cheeseId, veggieIds, quantity: 1, addressId: finalAddresses.data.find((a) => a.isDefault)._id }),
  });
  log('createOrder', { ok: createOrder.ok, status: createOrder.status, orderId: createOrder.data?._id, deliveryAddress: createOrder.data?.deliveryAddress, total: createOrder.data?.totalPrice });

  const createPayment = await fetchJson('/payments/create', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId: createOrder.data._id }),
  });
  log('createPayment', { ok: createPayment.ok, status: createPayment.status, mode: createPayment.data?.mode, amount: createPayment.data?.amount });

  const mockConfirm = await fetchJson('/payments/mock-confirm', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId: createOrder.data._id, success: true }),
  });
  log('mockConfirm', { ok: mockConfirm.ok, status: mockConfirm.status, paymentStatus: mockConfirm.data?.order?.paymentStatus });

  const saveWishlist = await fetchJson('/wishlist', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ baseId, sauceId, cheeseId, veggieIds, name: 'QA wishlist pizza' }),
  });
  log('saveWishlist', { ok: saveWishlist.ok, status: saveWishlist.status, data: saveWishlist.data });

  const wishlist = await fetchJson('/wishlist', { headers: { Authorization: `Bearer ${token}` } });
  log('wishlist', { ok: wishlist.ok, status: wishlist.status, data: wishlist.data?.map((p) => ({ name: p.name, unitPrice: p.unitPrice, available: p.available, items: p.items.map((i) => i.name) })) });

  const deleteWish = await fetchJson(`/wishlist/${wishlist.data[0]._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  log('deleteWish', { ok: deleteWish.ok, status: deleteWish.status, data: deleteWish.data });

  const adminLogin = await fetchJson('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ email: 'adisanureni1+admin@gmail.com', password: 'Olaniyi2023.' }),
  });
  log('adminLogin', { ok: adminLogin.ok, status: adminLogin.status, token: !!adminLogin.data?.token, user: adminLogin.data?.user });
  const adminToken = adminLogin.data?.token;

  if (adminToken) {
    const orders = await fetchJson('/orders/admin/all', { headers: { Authorization: `Bearer ${adminToken}` } });
    log('adminOrders', orders.data?.slice(0, 2).map((o) => ({ id: o._id, status: o.status, deliveryAddress: o.deliveryAddress, totalPrice: o.totalPrice })));

    const customers = await fetchJson('/admin/customers', { headers: { Authorization: `Bearer ${adminToken}` } });
    log('customers', customers.data?.slice(0, 2).map((c) => ({ name: c.name, orders: c.orders, spent: c.spent, email: c.email })));

    const reports7 = await fetchJson('/admin/reports?days=7', { headers: { Authorization: `Bearer ${adminToken}` } });
    const reports30 = await fetchJson('/admin/reports?days=30', { headers: { Authorization: `Bearer ${adminToken}` } });
    const reports90 = await fetchJson('/admin/reports?days=90', { headers: { Authorization: `Bearer ${adminToken}` } });
    log('reports7', { ok: reports7.ok, status: reports7.status, revenue: reports7.data?.revenue, orders: reports7.data?.orders, top: reports7.data?.topIngredients?.slice(0, 2) });
    log('reports30', { ok: reports30.ok, status: reports30.status, revenue: reports30.data?.revenue, orders: reports30.data?.orders });
    log('reports90', { ok: reports90.ok, status: reports90.status, revenue: reports90.data?.revenue, orders: reports90.data?.orders });

    const settingsGet = await fetchJson('/admin/settings', { headers: { Authorization: `Bearer ${adminToken}` } });
    log('settingsGet', settingsGet.data);

    const putSettings = await fetchJson('/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ alertEmail: 'adisanureni1+admin@gmail.com', defaultThreshold: 5, lowStockEnabled: true }),
    });
    log('putSettings', { ok: putSettings.ok, status: putSettings.status, data: putSettings.data });

    const testMail = await fetchJson('/admin/settings/test-email', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    log('testMail', { ok: testMail.ok, status: testMail.status, data: testMail.data });
  }
})();
