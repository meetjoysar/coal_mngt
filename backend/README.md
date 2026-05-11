# Coal Purchase Order Management Backend

Backend API for Gokul Fuel Chem's coal purchase order workflow.

## Stack

- Node.js + Express
- PostgreSQL
- Prisma ORM
- TypeScript

## Setup

1. Copy `.env.example` to `.env`.
2. Update `DATABASE_URL` for your PostgreSQL database.
3. Install dependencies:

```bash
npm install
```

4. Create the database tables:

```bash
npm run prisma:migrate
```

5. Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:4000/api` by default.

## Current API Surface

- `GET /api/health`
- `CRUD /api/firms`
- `CRUD /api/customers`
- `CRUD /api/suppliers`
- `CRUD /api/coal-sizes`
- `GET /api/purchase-orders`
- `POST /api/purchase-orders`
- `GET /api/purchase-orders/:id`
- `PUT /api/purchase-orders/:id`
- `POST /api/purchase-orders/:id/dispatches`
- `PUT /api/dispatches/:id`
- `DELETE /api/dispatches/:id`

Purchase order responses include computed totals for dispatched quantity, pending quantity, GST-inclusive sale amount, GST-inclusive purchase amount, transport amount, gross profit, profit per MT, and total PO profit. Dispatch transport cost is treated as cost per MT. Dispatch saves return a warning if the saved quantity exceeds the remaining PO quantity, but the save is allowed.

Payment tracking, invoice tracking, due dates, and outstanding amounts are intentionally not included yet.
