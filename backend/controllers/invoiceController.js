const Invoice = require("../models/Invoice");

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const user = req.user;

    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
    } = req.body;

    let subtotal = 0;
    let taxTotal = 0;

    // ✅ use taxPrecent to match model (or taxPercent if frontend sends it)
    items.forEach((item) => {
      const tax = item.taxPrecent ?? item.taxPercent ?? 0;
      subtotal += item.unitPrice * item.quantity;
      taxTotal += (item.unitPrice * item.quantity) * tax / 100;
    });

    const total = subtotal + taxTotal;

    // ✅ map items to match model schema exactly
    const mappedItems = items.map((item) => {
      const tax = item.taxPrecent ?? item.taxPercent ?? 0;
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      return {
        name:       item.name,
        quantity:   qty,
        unitPrice:  price,
        taxPrecent: tax,
        total:      qty * price * (1 + tax / 100),
      };
    });

    const invoice = await Invoice.create({
      user:          user.id,
      invoiceSchema: invoiceNumber, // ✅ required by model
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items:         mappedItems,
      notes,
      paymentTerms,
      subtotal,
      taxtotal:      taxTotal,      // ✅ model field is taxtotal not taxTotal
      total,
    });

    res.status(201).json(invoice);

  } catch (error) {
    res.status(500).json({ message: "Error creating invoice", error: error.message });
  }
};

// @desc    Get all invoices of logged-in user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(invoices);
  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 🔥 ADD THIS CHECK
    if (invoice.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoice",
      error: error.message,
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      status,
    } = req.body;

    let subtotal = 0;
    let taxTotal = 0;

    const mappedItems = (items || []).map((item) => {
      const tax   = item.taxPrecent ?? item.taxPercent ?? 0;
      const qty   = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      subtotal += qty * price;
      taxTotal += qty * price * tax / 100;
      return {
        name:       item.name,
        quantity:   qty,
        unitPrice:  price,
        taxPrecent: tax,
        total:      qty * price * (1 + tax / 100),
      };
    });

    const total = subtotal + taxTotal;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        invoiceSchema: invoiceNumber, // ✅
        invoiceNumber,
        invoiceDate,
        dueDate,
        billFrom,
        billTo,
        items:         mappedItems,
        notes,
        paymentTerms,
        status,
        subtotal,
        taxtotal:      taxTotal,      // ✅
        total,
      },
      { new: true }
    );

    if (!updatedInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json(updatedInvoice);

  } catch (error) {
    res.status(500).json({ message: "Error updating invoice", error: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
     try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json({ message: "Invoice deleted successfully" });

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting invoice", error: error.message });
  }
};