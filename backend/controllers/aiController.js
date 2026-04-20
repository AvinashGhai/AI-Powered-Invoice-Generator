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
const getDashboardSummary = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const invoices = await Invoice.find({ user: req.user._id });

    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const paidInvoices = invoices.filter(i => i.status === "paid").length;
    const unpaidInvoices = invoices.filter(i => i.status === "unpaid").length;

    const prompt = `Dashboard Stats: Total Revenue ₹${totalRevenue}, Paid Invoices: ${paidInvoices}, Unpaid Invoices: ${unpaidInvoices}. 
    Based on these numbers, give 3 ultra-short business insights as bullet points.`;

    const text = await generateAIResponse(prompt);

    const insightsArray = text
      ? text.split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(l => l.length > 5)
      : ["Analyzing your revenue...", "System status healthy."];

    res.status(200).json({
      totalRevenue,
      totalInvoices: invoices.length,
      paidInvoices,
      unpaidInvoices,
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