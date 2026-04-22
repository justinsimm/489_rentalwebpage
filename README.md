# 489_rentalwebpage

## Install/Setup

1. Clone the repo
2. In the main folder, run `npm install`
3. Create a `.env` file in the main folder with the following fields:

```env
SESSION_SECRET=<random long string (23 chars)>
MONGODB_URI=<mongodb uri>
STRIPE_SECRET_KEY=<Found in Stripe Sandbox>
STRIPE_PUBLIC_KEY=<Found in Stripe Sandbox>
```

4. Seed the database: `nodemon seed.js`
5. Start the server: `nodemon`
6. Open in browser: `http://localhost:3000/`

## Login Credentials

| Role      | Username | Password    |
|-----------|----------|-------------|
| User      | mscott   | password123 |
| Admin     | admin    | password123 |
| Moderator | mod      | password123 |
