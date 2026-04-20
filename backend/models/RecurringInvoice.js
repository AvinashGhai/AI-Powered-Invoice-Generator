const mongoose = require("mongoose");

const recurringInvoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Template data
  billFrom: {
    businessName: String,
    email:        String,
    address:      String,
    phone:        String,
  },
  billTo: {
    clientName: String,
    email:      String,
    address:    String,
    phone:      String,
  },
  items: [
    {
      name:       String,
      quantity:   Number,
      unitPrice:  Number,
      taxPercent: Number,
      total:      Number,
    },
  ],
  notes:        String,
  paymentTerms: { type: String, default: "Net 15" },

  // Schedule
  frequency:    {
    type: String,
    enum: ["monthly", "quarterly", "yearly", "custom"],
    required: true,
  },
  customDays:   { type: Number, default: null }, // only for custom
  startDate:    { type: Date, required: true },
  nextDueDate:  { type: Date, required: true },

  // Status
  status: {
    type: String,
    enum: ["active", "paused", "cancelled"],
    default: "active",
  },

  // Totals
  subtotal: Number,
  taxTotal: Number,
  total:    Number,

  // AI generated description
  description: String,
}, { timestamps: true });

module.exports = mongoose.model("RecurringInvoice", recurringInvoiceSchema);