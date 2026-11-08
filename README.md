# SliceCraft: Pizza Delivery Full-Stack Application

A MERN-stack pizza ordering and inventory management platform. Customers build their own pizza, pay with Razorpay and follow the order live. An admin manages stock, orders and customers from a separate panel.

> **Internship project.** AICTE Oasis Infobyte Internship Program (OIBSIP), 5 October to 15 November 2026.
> **Track:** Web Development & Designing, **Level 3**, Task 1: Pizza Delivery Full-Stack Application.
> **Author:** Adisa Nureni Olaniyi ([@Dev-Aditech](https://github.com/Dev-Aditech))

**Demo video:** https://lnkd.in/p/dsq3X9b2

---

## Table of contents

1. [Features](#features)
2. [Task requirements checklist](#task-requirements-checklist)
3. [Screenshots](#screenshots)
4. [Tech stack](#tech-stack)
5. [Project structure](#project-structure)
6. [Getting started](#getting-started)
7. [Environment variables](#environment-variables)
8. [Creating the admin account](#creating-the-admin-account)
9. [Testing the full flow](#testing-the-full-flow)
10. [API overview](#api-overview)
11. [Security notes](#security-notes)
12. [Design decisions and limitations](#design-decisions-and-limitations)
13. [Troubleshooting](#troubleshooting)

---

## Features

### Customer side

- **Account:** two-step registration (details, then password) with phone number, email verification, resend verification, JWT login, forgot password and reset by emailed link.
- **Password rules:** at least 8 characters with an uppercase letter, a lowercase letter, a number and a special character, shown as a live checklist and enforced again on the server.
- **Dashboard:** animated welcome banner, order statistics, recent orders and signature pizzas priced from live ingredient prices.
- **Custom pizza builder:** four steps. Choose a base (5 options), a sauce (5 options), a cheese (4 options) and any number of vegetables (8 options). Out-of-stock ingredients are hidden.
- **Order summary:** itemised ingredients, quantity from 1 to 10, a delivery address and a "save to wishlist" option, all shown before payment.
- **Payment:** Razorpay checkout in test mode with server-side signature verification.
- **Live order tracking:** Order Received, In Kitchen, Sent to Delivery, with an animated tracker that updates by itself.
- **Order history, wishlist and saved addresses** (up to 10, one default).
- **Profile:** edit name and phone, view statistics, change password.

### Admin side

- **Separate admin login**, not reachable from the customer sign-up flow.
- **Overview:** orders today, items low on stock, revenue, low-stock list and recent orders.
- **Inventory:** tabs for Crusts, Sauces, Cheeses and Vegetables. Edit price, alert threshold and stock. Low-stock rows are highlighted.
- **Automatic stock deduction** after every successful payment.
- **Low-stock email alerts** sent by a scheduled `node-cron` job when an item falls below its threshold (one email per item until it is restocked).
- **Order board:** tabs by status (In progress, Order Received, In Kitchen, Delivered, All). Change an order's status from a dropdown, and the customer's tracker updates within seconds.
- **Customers:** search, suspend for a number of minutes, hours or days, lift a suspension, or delete a customer.
- **Reports:** revenue per day, most used ingredients and orders by status for the last 7, 30 or 90 days.
- **Settings:** alert email address, switch alerts on or off, default threshold, apply a threshold to every item, send a test email.

### Also included

- Branded HTML emails with the site logo for verification, password reset and stock alerts.
- Responsive layout with a sidebar dashboard on desktop and a slide-out menu on phones.
- Mock payment mode that switches on automatically when no Razorpay keys are set.

---

## Task requirements checklist

All items from the Level 3 task card are implemented.

| Requirement | Status |
|---|---|
| User registration with email verification | Done |
| User login with JWT authorisation | Done |
| Forgot password flow (email reset link) | Done |
| Dashboard displaying available pizza varieties | Done |
| Custom pizza builder: base (5), sauce (5), cheese, vegetables (multi-select) | Done |
| Order summary page before payment | Done |
| Razorpay checkout in test mode | Done |
| Real-time order status on the user dashboard | Done (polling) |
| Separate admin login | Done |
| Inventory dashboard for bases, sauces, cheeses and vegetables | Done |
| Stock decremented automatically after each order | Done |
| Manual stock update for each inventory item | Done |
| Email to admin when stock falls below a configurable threshold (`node-cron`) | Done |
| Order management panel with status updates | Done |
| Status changes reflected in real time on the user's dashboard | Done (polling) |

---

## Screenshots

> Screenshots live in the [`screenshots`](screenshots) folder.

### Customer

| Page | Preview |
|---|---|
| Landing page | ![Landing page](./WebDev-L3-PizzaDelivery/screenshots/01-landing.png) |
| Registration, step 1 | ![Registration step 1](./WebDev-L3-PizzaDelivery/screenshots/02-register-step1.png) |
| Registration, step 2 | ![Registration step 2](./WebDev-L3-PizzaDelivery/screenshots/03-register-step2.png) |
| Login | ![Login](./WebDev-L3-PizzaDelivery/screenshots/04-login.png) |
| Dashboard | ![Customer dashboard](./WebDev-L3-PizzaDelivery/screenshots/05-dashboard.png) |
| Pizza builder | ![Pizza builder](./WebDev-L3-PizzaDelivery/screenshots/06-builder.png) |
| Order summary | ![Order summary](./WebDev-L3-PizzaDelivery/screenshots/07-summary.png) |
| Razorpay checkout | ![Razorpay checkout](./WebDev-L3-PizzaDelivery/screenshots/08-razorpay.png) |
| Live order tracking | ![Live order tracking](./WebDev-L3-PizzaDelivery/screenshots/09-live-tracking.png) |
| Profile | ![Profile](./WebDev-L3-PizzaDelivery/screenshots/10-profile.png) |

### Admin

| Page | Preview |
|---|---|
| Overview | ![Admin overview](./WebDev-L3-PizzaDelivery/screenshots/11-admin-overview.png) |
| Inventory | ![Admin inventory](./WebDev-L3-PizzaDelivery/screenshots/12-admin-inventory.png) |
| Order board | ![Admin order board](./WebDev-L3-PizzaDelivery/screenshots/13-admin-orders.png) |
| Customers | ![Admin customers](./WebDev-L3-PizzaDelivery/screenshots/14-admin-customers.png) |
| Reports | ![Admin reports](./WebDev-L3-PizzaDelivery/screenshots/15-admin-reports.png) |
| Settings | ![Admin settings](./WebDev-L3-PizzaDelivery/screenshots/16-admin-settings.png) |

### Emails

| Email | Preview |
|---|---|
| Verification email | ![Verification email](./WebDev-L3-PizzaDelivery/screenshots/17-email-verification.png) |
| Low-stock alert | ![Low-stock alert](./WebDev-L3-PizzaDelivery/screenshots/18-email-low-stock.png) |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS v4, lucide-react icons |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| Payments | Razorpay (test mode) |
| Email | Nodemailer (any SMTP account, or Ethereal for development) |
| Scheduled jobs | node-cron |

---

## Project structure

```text
WebDev-L3-PizzaDelivery/
├── client/                      React app (Vite)
│   ├── public/logo.png
│   └── src/
│       ├── api.js               Axios instance, token handling, sign-out rules
│       ├── AuthContext.jsx      Logged-in user state
│       ├── PizzaContext.jsx     Ingredients, current pizza and quantity
│       ├── ProtectedRoute.jsx   Role-based route guard
│       ├── passwordRules.js     Password and phone validation
│       ├── presets.js           Signature pizzas (ingredient names)
│       ├── razorpay.js          Loads the Razorpay checkout script
│       ├── ui.jsx               Shared form styles
│       ├── components/          Layouts, sidebar shell, tabs, banner, form parts
│       └── pages/               Public, customer and admin pages
├── server/
│   ├── assets/logo.png          Logo used inside emails
│   ├── controllers/             Request handlers
│   ├── middleware/              Authentication and admin guard
│   ├── models/                  Mongoose models
│   ├── routes/                  Express routers
│   ├── utils/                   Email, validation, scheduled job, helpers
│   ├── seed.js                  Creates ingredients and the admin account
│   └── server.js                App entry point
├── screenshots/                 Images used in this README
└── README.md
```

---

## Getting started

### Prerequisites

- **Node.js** 20 or newer (built and tested with Node 24) and **npm**
- **Git**
- A free **MongoDB Atlas** cluster and a database user
- Optional: a **Razorpay** account in test mode (without keys, the app uses a mock payment screen)
- Optional: a Gmail address with an app password (without it, emails are shown as Ethereal preview links in the server terminal)

### 1. Get the code

```bash
git clone https://github.com/Dev-Aditech/OIBSIP.git
cd OIBSIP/WebDev-L3-PizzaDelivery
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in your own values (see [Environment variables](#environment-variables)). On Windows, copy the file by hand if `cp` is not available.

In MongoDB Atlas, add your IP address under **Network Access** (use `0.0.0.0/0` for development) and copy the connection string for the user you created.

Create the ingredients and the admin account:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

You should see `MongoDB connected` and `Server running on port 5000`.

### 3. Set up the client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the address printed by Vite, normally <http://localhost:5173>.

### Scripts

| Where | Command | What it does |
|---|---|---|
| `server` | `npm run dev` | Starts the API with automatic restarts (nodemon) |
| `server` | `npm start` | Starts the API with Node |
| `server` | `npm run seed` | Creates the 22 ingredients and the admin account |
| `client` | `npm run dev` | Starts the Vite dev server |
| `client` | `npm run build` | Builds the app for production |
| `client` | `npm run lint` | Checks the code with ESLint |

> The client talks to the API at `http://localhost:5000/api`, set at the top of `client/src/api.js`. Change it there if your API runs elsewhere.

---

## Environment variables

Set these in `server/.env`. **Never commit this file.** It is already listed in `.gitignore`.

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string, including the database name |
| `PORT` | No | API port (default `5000`) |
| `JWT_SECRET` | Yes | Long random text used to sign login tokens |
| `CLIENT_URL` | Yes | Address of the React app. Links in emails are built from it, so it must match the port Vite uses |
| `ADMIN_NAME` | Yes for seed | Display name of the admin account |
| `ADMIN_EMAIL` | Yes for seed | Admin login email. Also the default address for low-stock alerts |
| `ADMIN_PASSWORD` | Yes for seed | Admin login password |
| `RAZORPAY_KEY_ID` | No | Razorpay **test** key ID (starts with `rzp_test_`) |
| `RAZORPAY_KEY_SECRET` | No | Razorpay test key secret |
| `EMAIL_HOST` | No | SMTP host, for example `smtp.gmail.com`. Leave empty to use Ethereal |
| `EMAIL_PORT` | No | SMTP port (default `587`) |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password or app password |
| `EMAIL_FROM` | No | Sender shown in emails, for example `"SliceCraft <you@example.com>"` |
| `LOW_STOCK_CRON` | No | How often to check stock, as a cron expression (default every minute: `* * * * *`) |

Example with placeholder values:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/pizzaapp?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=replace-with-a-long-random-text
CLIENT_URL=http://localhost:5173

ADMIN_NAME=Pizza Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose-a-strong-password

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-test-secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="SliceCraft <you@gmail.com>"
```

**Without SMTP settings**, the server sends emails through Ethereal, a fake inbox for developers. Nothing reaches a real inbox. Instead, the terminal prints a line like `Email preview: https://ethereal.email/message/...`. Open that link to read the email and click its buttons.

**Without Razorpay keys**, the order summary page uses a mock payment so the whole flow can still be tried.

---

## Creating the admin account

The admin is created by the seed script from `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. It cannot be created through registration.

```bash
cd server
npm run seed
```

- The seed is safe to run again. It only adds ingredients that do not exist yet, and it never resets your stock.
- If the admin already exists, it is left unchanged. To change the admin's email or password, delete the old admin document in MongoDB, update `.env`, and run the seed again.
- Admins sign in at `/admin/login`. Customers sign in at `/login`. Each login refuses the other's accounts.

---

## Testing the full flow

1. Open the app and click **Sign up**. Fill in your details, then choose a password that meets the checklist.
2. Open the verification email (or the Ethereal preview link in the server terminal) and click **Verify my email**.
3. Log in. On the **Addresses** page, add a delivery address.
4. Open **Build pizza**, choose a crust, sauce, cheese and some vegetables, then review the order summary.
5. Choose the address and click **Pay now**. In the Razorpay popup, use a test payment method:
   - **Card:** 4718 6091 0820 4366, any future expiry date, any CVV. If asked for an OTP, enter any digits.
   - **UPI:** `success@razorpay` to succeed or `failure@razorpay` to fail.
6. Open **My orders**. The tracker shows **Order Received**.
7. In a private browser window, log in as the admin at `/admin/login`.
8. On the **Order board**, find the order and change its status to **In Kitchen**, then **Sent to Delivery**. In the customer window, the tracker updates within seconds.
9. On **Inventory**, check that the ingredients in that order went down by the quantity ordered.
10. Set an ingredient's stock below its alert threshold and click **Save**. Within a minute, the low-stock alert email arrives (or its preview link appears in the terminal).
11. Explore **Customers** (suspend, unsuspend, delete), **Reports** and **Settings**.

Test card and UPI details come from [Razorpay's test documentation](https://razorpay.com/docs/payments/payments/test-upi-details/), which may change. No real money is ever charged in test mode.

---

## API overview

All routes start with `/api`. Routes marked **User** need a customer login token and routes marked **Admin** need an admin token, sent as `Authorization: Bearer <token>`.

| Area | Method and path | Access | Purpose |
|---|---|---|---|
| Auth | `POST /auth/register` | Public | Create an account and send the verification email |
| Auth | `GET /auth/verify/:token` | Public | Verify an email address |
| Auth | `POST /auth/resend-verification` | Public | Send a new verification link |
| Auth | `POST /auth/login` | Public | Customer login |
| Auth | `POST /auth/admin-login` | Public | Admin login |
| Auth | `POST /auth/forgot-password` | Public | Email a password reset link |
| Auth | `POST /auth/reset-password/:token` | Public | Set a new password |
| Auth | `GET /auth/me` | User or Admin | Current account details |
| Auth | `PUT /auth/profile` | User or Admin | Update name and phone |
| Auth | `PUT /auth/password` | User or Admin | Change password |
| Inventory | `GET /inventory` | User | In-stock ingredients |
| Inventory | `GET /inventory/admin` | Admin | All ingredients with stock levels |
| Inventory | `PUT /inventory/:id` | Admin | Update stock, threshold or price |
| Orders | `POST /orders/summary` | User | Price a pizza without saving |
| Orders | `POST /orders` | User | Create a pending order |
| Orders | `GET /orders/my`, `GET /orders/:id` | User | The customer's own orders |
| Orders | `GET /orders/admin/all` | Admin | All paid orders |
| Orders | `PUT /orders/:id/status` | Admin | Change an order's status |
| Payments | `POST /payments/create` | User | Start a Razorpay payment |
| Payments | `POST /payments/verify` | User | Verify the payment signature, then deduct stock |
| Payments | `POST /payments/mock-confirm` | User | Mock payment (only when Razorpay is not configured) |
| Wishlist | `GET`, `POST /wishlist`, `DELETE /wishlist/:id` | User | Saved pizzas |
| Addresses | `GET`, `POST /addresses`, `PUT /addresses/:id/default`, `DELETE /addresses/:id` | User | Delivery addresses |
| Admin | `GET /admin/customers` | Admin | Customers with order totals |
| Admin | `PUT /admin/customers/:id/suspend`, `PUT /admin/customers/:id/unsuspend`, `DELETE /admin/customers/:id` | Admin | Manage a customer |
| Admin | `GET /admin/reports?days=30` | Admin | Sales report (`days` can be 7, 30 or 90) |
| Admin | `GET`, `PUT /admin/settings`, `POST /admin/settings/apply-threshold`, `POST /admin/settings/test-email` | Admin | Alert settings |

---

## Security notes

- Passwords are hashed with bcrypt. Plain text is never stored.
- Login tokens (JWT) are checked on every request, together with the account itself. Deleted or suspended accounts are locked out immediately, and the account check is cached for 30 seconds to keep requests fast.
- **Prices are calculated on the server** from the database. The browser only sends ingredient IDs, so a price cannot be tampered with.
- Razorpay payments are confirmed by checking the payment **signature** with the secret key. An order can only change from pending to paid once, so stock is never deducted twice.
- Password rules, phone numbers and all other inputs are validated on the server, not only in the browser.
- Password reset tokens are stored as hashes and expire after one hour. Verification links expire after 24 hours.
- Login and recovery messages do not reveal whether an email address is registered.
- Admin routes check the role from the database. Admins cannot be suspended or deleted through the customer tools.
- Secrets live in `.env`, which is excluded from Git.

---

## Design decisions and limitations

- **Live updates use polling, not WebSockets.** The customer's order page asks for updates every 5 seconds while an order is being made, and the admin order board every 10 seconds. Polling is simpler and was allowed by the task. It pauses while the browser tab is hidden.
- **One custom pizza per order.** A customer chooses the ingredients once and a quantity from 1 to 10. There is no multi-item cart, so the cart icon in the header is only a shortcut to the order summary.
- **Orders are kept when a customer is deleted.** Paid orders stay in the sales records and show as "Deleted customer".
- **Razorpay runs in test mode only.** No real payments are made.
- **Development setup.** The app is configured for `localhost`. Hosting it online would need a hosted API address, a production `CLIENT_URL`, and an email provider that works over HTTPS if the host blocks SMTP ports.
- **Photos load from Unsplash**, so they need an internet connection.

---

## Troubleshooting

| Problem | What to try |
|---|---|
| `MongoDB connection error` mentioning an IP | In Atlas, open **Network Access** and add your current IP or `0.0.0.0/0`. Wait until it shows **Active**. |
| `bad auth` or `Authentication failed` | Check the username and password in `MONGO_URI`. Remove the `<>` brackets and avoid special characters in the password. |
| Verification or reset link opens the wrong address | `CLIENT_URL` must match the port Vite is using (look at the terminal when you run `npm run dev`). Restart the server after editing `.env`. |
| No emails arrive | Without `EMAIL_HOST`, use the `Email preview:` link in the server terminal. With Gmail, you need 2-Step Verification and an **app password**. |
| Admin login says invalid email or password | Run `npm run seed`. If you changed `ADMIN_EMAIL`, delete the old admin document in MongoDB first. |
| Razorpay popup does not open | Check that both Razorpay keys are set, are test keys, and that the server was restarted after you added them. |
| `EADDRINUSE` (port already in use) | Another copy is running. Close the old terminal or change `PORT`. |
| Styles or animations missing | Stop the client and run `npm run dev` again, because Tailwind settings load at startup. |

---

## License and purpose

Built for learning as part of the AICTE Oasis Infobyte Internship Program. Not intended for production use.