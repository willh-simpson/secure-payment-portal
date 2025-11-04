/**
 * mock the backend api simply in order to confirm frontend endpoints. does not persist to db
 */

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { nanoid } = require("nanoid");

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

/**
 * in-memory store
 * payment = { id, fromAccount, toAccount, amount (string), currency, status, createdAt, memo, idempotencyKey }
 */
const payments = new Map();

// POST /api/payments
app.post("/api/payments", (req, res) => {
  const body = req.body || {};

  // server-side validation
  if (!body.fromAccount || !body.toAccount || !body.amount || !body.currency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // if idempencyKey found, return existing record
  if (body.idempotencyKey) {
    for (const p of payments.values()) {
      if (p.idempotencyKey === body.idempotencyKey) {
        return res.status(200).json(p);
      }
    }
  }

  const id = nanoid();
  const payment = {
    id,
    fromAccount: body.fromAccount, // this will be masked in prod
    toAccount: body.toAccount,
    amount: String(body.amount),
    currency: body.currency,
    status: "pending",
    createdAt: new Date().toISOString(),
    memo: body.memo || null,
    idempotencyKey: body.idempotencyKey || null,
    // add functionality for the following later
    requiresMfa: false,
    mfaToken: null,
  };

  payments.set(id, payment);

  return res.status(201).json(payment);
});

// POST /api/payments/:id/confirm (simulate MFA confirm)
app.post("/api/payments/:id/confirm", (req, res) => {
  const id = req.params.id;
  const payment = payments.get(id);

  if (!payment) {
    return res.status(404).json({ error: "Not found" });
  }

  // accept any mfaCode in mock
  payment.status = "confirmed";
  payments.set(id, payment);

  return res.json(payment);
});

// GET /api/payments/:id (individual payment)
app.get("/api/payments/:id", (req, res) => {
  const id = req.params.id;
  const payment = payments.get(id);

  if (!payment) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(payment);
});

// GET /api/payments (all payments)
app.get("/api/payments", (req, res) => {
  return res.json(Array.from(payments.values()));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Mock API listening on ${port}`);
});
