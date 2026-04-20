const express = require("express");
const {
  parseInvoiceFromText,
  generateReminderEmail,
  getDashboardSummary,
  parseRecurringSchedule,  // ← add this
} = require("../controllers/aiController");
const { protect } = require("../middleware/authmiddleware.js");

console.log({
  parseInvoiceFromText,
  generateReminderEmail,
  getDashboardSummary,
  parseRecurringSchedule,
});

const router = express.Router();

router.post("/parse-text",        protect, parseInvoiceFromText);
router.post("/generate-reminder", protect, generateReminderEmail);
router.get("/dashboard-summary",  protect, getDashboardSummary);
router.post("/parse-recurring",   protect, parseRecurringSchedule); // ← add this

module.exports = router;