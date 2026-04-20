require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const cron     = require("node-cron");
const connectDB = require("./config/db");

const authRoutes      = require("./routes/authRoute");
const invoiceRoutes   = require("./routes/invoiceRoute");
const aiRoutes        = require("./routes/aiRoute");
const recurringRoutes = require("./routes/RecurringRoute");

const { processRecurringInvoices } = require("./controllers/RecurringController");

const app = express();

app.use(cors({
  origin:         "*",
  methods:        ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

connectDB();
app.use(express.json());

app.use("/api/auth",      authRoutes);
app.use("/api/invoices",  invoiceRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/recurring", recurringRoutes);

// ── Cron job: runs every day at midnight ─────────────────
cron.schedule("0 0 * * *", async () => {
  console.log(" Running recurring invoice cron job...");
  await processRecurringInvoices();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));