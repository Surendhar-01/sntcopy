# Sri Nikil Trading Dashboard

Inventory, billing, pricing, customer, sales, report, settings, and login activity dashboard for Sri Nikil Trading.

## Setup

```bash
npm install
npm install --prefix server
```

Copy `server/.env.example` to `server/.env.development` and fill MongoDB Atlas and SMTP values.

## Run

```bash
npm run dev
```

Client runs with Vite and the Express MongoDB API runs on `PORT` from the server env file.

## Build

```bash
npm run build
```
