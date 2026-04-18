const { GoogleGenAI } = require("@google/genai");
const Invoice = require("../models/Invoice");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// 🔹 Parse Invoice from Text
const parseInvoiceFromText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const prompt = `
You are an expert invoice data extraction AI. Analyze the following text and extract the relevant information.
The output MUST be a valid JSON object.

The JSON object should have the following structure:
{
  "clientName": "string",
  "email": "string (if available)",
  "address": "string (if available)",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": number
    }
  ],
  "total": number,
  "invoiceNumber": "string",
  "dueDate": "string"
}

Invoice Text:
${text}

IMPORTANT:
- Return ONLY JSON
- No explanation
- No markdown
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ fixed
      contents: prompt,
    });

    let responseText = response.text;
    if (typeof responseText !== "string") {
      if (typeof response.text === "function") {
        responseText = response.text();
      } else {
        throw new Error("Could not extract text from AI response.");
      }
    }

    const cleanedJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (err) {
      console.error("JSON parse error:", cleanedJson);
      return res.status(500).json({
        message: "AI returned invalid JSON",
        raw: responseText,
      });
    }

    res.status(200).json(parsedData);

  } catch (error) {
    console.error("Error parsing invoice with AI:", error);
    res.status(500).json({
      message: "Failed to parse invoice data from text.",
      details: error.message,
    });
  }
};

// 🔹 Generate Reminder Email
const generateReminderEmail = async (req, res) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ message: "Invoice ID is required" });
  }

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const prompt = `
You are a professional and polite accounting assistant. Write a friendly reminder email to a client.

Use the following details to personalize the email:
- Client Name: ${invoice.billTo?.Clientname || invoice.billTo?.clientName || "Client"}
- Invoice Number: ${invoice.invoiceNumber}
- Amount Due: $${(invoice.total || 0).toFixed(2)}
- Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}

The tone should be friendly but clear. Keep it concise. Start the email with "Subject:".
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ fixed
      contents: prompt,
    });

    const emailText = response.text;
    res.status(200).json({ email: emailText });

  } catch (error) {
    console.error("Error generating reminder email with AI:", error);
    res.status(500).json({
      message: "Failed to generate reminder email.",
      details: error.message,
    });
  }
};

// 🔹 Dashboard Summary with AI Insights
const getDashboardSummary = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id });

    if (invoices.length === 0) {
      return res.status(200).json({
        insights: ["No invoice data yet. Create your first invoice to get AI-powered insights."],
      });
    }

    const paidInvoices   = invoices.filter((inv) => inv.status === "paid");
    const unpaidInvoices = invoices.filter((inv) => inv.status === "unpaid");
    const totalRevenue     = paidInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const totalOutstanding = unpaidInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const overdueInvoices  = unpaidInvoices.filter(
      (inv) => inv.dueDate && new Date(inv.dueDate) < new Date()
    );

    // ✅ Always return fallback insights without calling AI
    // Remove this block and uncomment the AI section below once you have quota
    const insights = [
      `You have ${invoices.length} total invoice${invoices.length !== 1 ? "s" : ""} on record.`,
      `$${totalOutstanding.toFixed(2)} outstanding across ${unpaidInvoices.length} unpaid invoice${unpaidInvoices.length !== 1 ? "s" : ""}.`,
      overdueInvoices.length > 0
        ? `${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? "s are" : " is"} overdue — follow up soon.`
        : `No overdue invoices — great job staying on top of payments!`,
    ];

    return res.status(200).json({ insights });

    
    const dataSummary = `
- Total invoices: ${invoices.length}
- Paid: ${paidInvoices.length}, Unpaid: ${unpaidInvoices.length}
- Overdue: ${overdueInvoices.length}
- Revenue: $${totalRevenue.toFixed(2)}, Outstanding: $${totalOutstanding.toFixed(2)}
`;
    const prompt = `
You are a financial assistant. Based on this invoice data, generate exactly 3 short actionable insights.
Data: ${dataSummary}
Rules: Return ONLY a JSON array of 3 strings. No markdown. No explanation.
Example: ["Insight one.", "Insight two.", "Insight three."]
`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    let responseText = response.text;
    if (typeof responseText === "function") responseText = responseText();
    const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    let aiInsights;
    try {
      aiInsights = JSON.parse(cleaned);
      if (!Array.isArray(aiInsights)) throw new Error("Not an array");
    } catch {
      aiInsights = insights; // fallback
    }
    return res.status(200).json({ insights: aiInsights });
    

  } catch (error) {
    console.error("Error generating dashboard summary:", error);
    res.status(500).json({
      message: "Failed to generate dashboard summary.",
      details: error.message,
    });
  }
};

module.exports = {
  parseInvoiceFromText,
  generateReminderEmail,
  getDashboardSummary,
};