const RecurringInvoice = require("../models/RecurringInvoice");
const Invoice          = require("../models/Invoice");

// ── Helper: calculate next due date ─────────────────────
const getNextDueDate = (fromDate, frequency, customDays) => {
  const date = new Date(fromDate);
  switch (frequency) {
    case "monthly":   date.setMonth(date.getMonth() + 1);     break;
    case "quarterly": date.setMonth(date.getMonth() + 3);     break;
    case "yearly":    date.setFullYear(date.getFullYear() + 1); break;
    case "custom":    date.setDate(date.getDate() + (customDays || 30)); break;
    default:          date.setMonth(date.getMonth() + 1);
  }
  return date;
};

// ── Create recurring invoice ─────────────────────────────
exports.createRecurring = async (req, res) => {
  try {
    const {
      billFrom, billTo, items, notes, paymentTerms,
      frequency, customDays, startDate, description,
    } = req.body;

    // Calculate totals
    let subtotal = 0, taxTotal = 0;
    const mappedItems = (items || []).map((item) => {
      const qty   = Number(item.quantity)  || 1;
      const price = Number(item.unitPrice) || 0;
      const tax   = Number(item.taxPercent) || 0;
      subtotal += qty * price;
      taxTotal += qty * price * tax / 100;
      return { name: item.name, quantity: qty, unitPrice: price, taxPercent: tax, total: qty * price * (1 + tax / 100) };
    });
    const total = subtotal + taxTotal;

    const start       = new Date(startDate);
    const nextDueDate = getNextDueDate(start, frequency, customDays);

    const recurring = await RecurringInvoice.create({
      user:        req.user.id,
      billFrom,
      billTo,
      items:       mappedItems,
      notes,
      paymentTerms,
      frequency,
      customDays:  customDays || null,
      startDate:   start,
      nextDueDate,
      subtotal,
      taxTotal,
      total,
      description,
    });

    res.status(201).json(recurring);
  } catch (error) {
    res.status(500).json({ message: "Error creating recurring invoice", error: error.message });
  }
};

// ── Get all recurring invoices ───────────────────────────
exports.getRecurring = async (req, res) => {
  try {
    const recurring = await RecurringInvoice.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recurring invoices", error: error.message });
  }
};

// ── Pause recurring invoice ──────────────────────────────
exports.pauseRecurring = async (req, res) => {
  try {
    const recurring = await RecurringInvoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: "paused" },
      { returnDocument: "after" }
    );
    if (!recurring) return res.status(404).json({ message: "Not found" });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: "Error pausing", error: error.message });
  }
};

// ── Resume recurring invoice ─────────────────────────────
exports.resumeRecurring = async (req, res) => {
  try {
    const recurring = await RecurringInvoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: "active" },
      { returnDocument: "after" }
    );
    if (!recurring) return res.status(404).json({ message: "Not found" });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: "Error resuming", error: error.message });
  }
};

// ── Cancel recurring invoice ─────────────────────────────
exports.cancelRecurring = async (req, res) => {
  try {
    const recurring = await RecurringInvoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: "cancelled" },
      { returnDocument: "after" }
    );
    if (!recurring) return res.status(404).json({ message: "Not found" });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: "Error cancelling", error: error.message });
  }
};

// ── Delete recurring invoice ─────────────────────────────
exports.deleteRecurring = async (req, res) => {
  try {
    const recurring = await RecurringInvoice.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!recurring) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting", error: error.message });
  }
};

// ── CRON: Auto-create invoices ───────────────────────────
exports.processRecurringInvoices = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all active recurring invoices due today
    const dueRecurring = await RecurringInvoice.find({
      status:      "active",
      nextDueDate: { $gte: today, $lt: tomorrow },
    });

    console.log(`🔄 Processing ${dueRecurring.length} recurring invoices...`);

    for (const rec of dueRecurring) {
      // Get latest invoice number
      const lastInvoice = await Invoice.findOne({ user: rec.user }).sort({ createdAt: -1 });
      let maxNum = 0;
      if (lastInvoice) {
        const num = parseInt(lastInvoice.invoiceNumber?.split("-")[1]);
        if (!isNaN(num)) maxNum = num;
      }
      const invoiceNumber = `INV-${String(maxNum + 1).padStart(3, "0")}`;

      // Calculate due date based on payment terms
      const dueDate = getNextDueDate(new Date(), rec.frequency, rec.customDays);

      // Map items to invoice schema
      const mappedItems = rec.items.map((item) => ({
        name:       item.name,
        quantity:   item.quantity,
        unitPrice:  item.unitPrice,
        taxPrecent: item.taxPercent,
        total:      item.total,
      }));

      // Create the actual invoice
      await Invoice.create({
        user:          rec.user,
        invoiceSchema: invoiceNumber,
        invoiceNumber,
        invoiceDate:   new Date(),
        dueDate,
        billFrom:      rec.billFrom,
        billTo:        rec.billTo,
        items:         mappedItems,
        notes:         rec.notes,
        paymentTerms:  rec.paymentTerms,
        subtotal:      rec.subtotal,
        taxtotal:      rec.taxTotal,
        total:         rec.total,
        status:        "unpaid",
      });

      // Update nextDueDate for the recurring invoice
      const nextDueDate = getNextDueDate(rec.nextDueDate, rec.frequency, rec.customDays);
      await RecurringInvoice.findByIdAndUpdate(rec._id, { nextDueDate });

      console.log(`✅ Auto-created invoice ${invoiceNumber} for recurring ${rec._id}`);
    }
  } catch (error) {
    console.error(" Cron job error:", error.message);
  }
};