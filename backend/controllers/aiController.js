const aiCache = {}; 
console.log("NEW AI SYSTEM RUNNING");
const Invoice = require("../models/Invoice");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Centralized AI Helper
 */
const generateAIResponse = async (prompt) => {
  const cacheKey = Buffer.from(prompt).toString('base64').slice(0, 50);
  
  // Return cached response if exists and less than 1 hour old
  if (aiCache[cacheKey] && Date.now() - aiCache[cacheKey].time < 3600000) {
    return aiCache[cacheKey].text;
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.choices[0].message.content;
    aiCache[cacheKey] = { text, time: Date.now() };
    return text;
  } catch (error) {
    console.error("AI Error:", JSON.stringify(error));
    return "• Unable to generate insights\n• Try again later";
  }
};


/**
 * 1. Parse Invoice from Text
 */
const parseInvoiceFromText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const prompt = `Extract invoice details from this text and return ONLY a valid JSON object with no markdown or backticks:
    {
      "clientName": "string",
      "email": "string",
      "items": [{ "name": "string", "quantity": number, "unitPrice": number, "taxPercent": number }]
    }
    Text: ${text}`;

    const aiText = await generateAIResponse(prompt);
    if (!aiText) throw new Error("AI failed to return data");

    const clean = aiText.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(clean));
  } catch (error) {
    console.error("Parse Invoice Error:", error);
    res.status(500).json({ message: "Failed to parse invoice structure" });
  }
};

/**
 * 2. Generate Reminder Email
 */
const generateReminderEmail = async (req, res) => {
  try {
    const { clientName, amount, dueDate } = req.body;
    const prompt = `Write a professional, 2-sentence payment reminder for ${clientName} for ₹${amount} due on ${dueDate}. No subject line, just the body text.`;

    const text = await generateAIResponse(prompt);
    res.status(200).json({ email: text || "Reminder: Your payment is due." });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate email" });
  }
};

/**
 * 3. Dashboard Summary
 */
/**
 * 3. Dashboard Summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const invoices = await Invoice.find({ user: req.user._id });

    if (invoices.length === 0) {
      return res.status(200).json({
        totalRevenue: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        unpaidInvoices: 0,
        insights: [
          "Create your first invoice to start receiving AI-powered insights.",
          "Once you have invoices, I'll analyze your payment patterns and revenue trends.",
          "Track clients, overdue payments, and cash flow all in one place.",
        ],
      });
    }

    // ── Compute rich stats ──────────────────────────────────────────
    const now = new Date();

    const totalRevenue    = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const paidInvoices    = invoices.filter(i => i.status === "paid");
    const unpaidInvoices  = invoices.filter(i => i.status === "unpaid");
    const overdueInvoices = unpaidInvoices.filter(i => i.dueDate && new Date(i.dueDate) < now);

    const paidRevenue     = paidInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const unpaidRevenue   = unpaidInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const overdueRevenue  = overdueInvoices.reduce((s, i) => s + (i.total || 0), 0);

    const collectionRate  = invoices.length
      ? Math.round((paidInvoices.length / invoices.length) * 100)
      : 0;

    // Average days to pay (for paid invoices that have both dates)
    const paidWithDates = paidInvoices.filter(i => i.invoiceDate && i.dueDate);
    const avgDaysToPay  = paidWithDates.length
      ? Math.round(
          paidWithDates.reduce((s, i) => {
            return s + Math.abs((new Date(i.dueDate) - new Date(i.invoiceDate)) / 86400000);
          }, 0) / paidWithDates.length
        )
      : null;

    // Top client by revenue
    const clientMap = {};
    invoices.forEach(i => {
      const name = i.billTo?.clientName || i.billTo?.Clientname || "Unknown";
      clientMap[name] = (clientMap[name] || 0) + (i.total || 0);
    });
    const topClient = Object.entries(clientMap).sort((a, b) => b[1] - a[1])[0];

    // This month vs last month revenue
    const thisMonth = invoices.filter(i => {
      const d = new Date(i.invoiceDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, i) => s + (i.total || 0), 0);

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = invoices.filter(i => {
      const d = new Date(i.invoiceDate);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    }).reduce((s, i) => s + (i.total || 0), 0);

    const monthGrowth = lastMonth > 0
      ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
      : null;

    // Most common invoice item
    const itemMap = {};
    invoices.forEach(i => (i.items || []).forEach(item => {
      const name = item.name?.trim();
      if (name) itemMap[name] = (itemMap[name] || 0) + 1;
    }));
    const topItem = Object.entries(itemMap).sort((a, b) => b[1] - a[1])[0];

    // ── Build detailed prompt ───────────────────────────────────────
    const prompt = `You are a smart financial assistant analyzing invoice data for a freelancer or small business owner. 
Based on the following real data, generate exactly 5 specific, actionable, and personalized insights. 
Each insight must be a single clear sentence. Do not use bullet points, numbers, or labels — just plain sentences separated by newlines.

DATA:
- Total invoices: ${invoices.length}
- Total revenue: $${totalRevenue.toFixed(2)}
- Paid invoices: ${paidInvoices.length} ($${paidRevenue.toFixed(2)})
- Unpaid invoices: ${unpaidInvoices.length} ($${unpaidRevenue.toFixed(2)})
- Overdue invoices: ${overdueInvoices.length} ($${overdueRevenue.toFixed(2)})
- Collection rate: ${collectionRate}%
- Average payment window: ${avgDaysToPay !== null ? avgDaysToPay + " days" : "not enough data"}
- Top client by revenue: ${topClient ? topClient[0] + " ($" + topClient[1].toFixed(2) + ")" : "not enough data"}
- This month revenue: $${thisMonth.toFixed(2)}
- Last month revenue: $${lastMonth.toFixed(2)}
- Month-over-month growth: ${monthGrowth !== null ? monthGrowth + "%" : "not enough data"}
- Most billed service/item: ${topItem ? topItem[0] + " (" + topItem[1] + " times)" : "not enough data"}

Generate 5 insights that are specific to this data. Reference actual numbers. Give actionable advice where possible.`;

    const text = await generateAIResponse(prompt);

    const insightsArray = text
      ? text.split("\n").map(l => l.replace(/^[-•*\d.]\s*/, "").trim()).filter(l => l.length > 10).slice(0, 5)
      : [
          `Your collection rate is ${collectionRate}% — ${collectionRate >= 70 ? "great job!" : "consider sending reminders to unpaid clients."}`,
          `You have $${unpaidRevenue.toFixed(2)} in outstanding invoices.`,
          overdueInvoices.length > 0 ? `${overdueInvoices.length} invoice(s) are overdue totaling $${overdueRevenue.toFixed(2)}.` : "No overdue invoices — great!",
          topClient ? `${topClient[0]} is your top client with $${topClient[1].toFixed(2)} billed.` : "Add more clients to diversify revenue.",
          monthGrowth !== null ? `Revenue ${monthGrowth >= 0 ? "grew" : "dropped"} by ${Math.abs(monthGrowth)}% compared to last month.` : "Keep creating invoices to track monthly growth.",
        ];

    res.status(200).json({
      totalRevenue,
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      insights: insightsArray,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Failed to generate summary" });
  }
};

/**
 * 4. Parse Recurring Schedule
 */
const parseRecurringSchedule = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const prompt = `Return ONLY a valid JSON object with no markdown or backticks for this recurring schedule:
    { "clientName": "string", "email": "string", "amount": number, "frequency": "monthly|yearly", "startDate": "YYYY-MM-DD" }
    Text: ${text}`;

    const aiText = await generateAIResponse(prompt);
    const clean = aiText.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(clean));
  } catch (error) {
    res.status(500).json({ message: "Failed to parse schedule" });
  }
};

module.exports = {
  parseInvoiceFromText,
  generateReminderEmail,
  getDashboardSummary,
  parseRecurringSchedule,
};