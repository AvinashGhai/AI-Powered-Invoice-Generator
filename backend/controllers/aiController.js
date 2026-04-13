const { GoogleGenAI } = require("@google/genai");

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
      model: "gemini-1.5-flash-latest",
      contents: prompt,
    });

    let responseText = response.text;

    // Handle case where response.text is not a string
    if (typeof responseText !== "string") {
      if (typeof response.text === "function") {
        responseText = response.text();
      } else {
        throw new Error("Could not extract text from AI response.");
      }
    }

    // Clean markdown (```json ... ```)
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
- Client Name: ${invoice.billTo.clientName}
- Invoice Number: ${invoice.invoiceNumber}
- Amount Due: $${invoice.total.toFixed(2)}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

The tone should be friendly but clear. Keep it concise. Start the email with "Subject:".
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
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

// 🔹 Dashboard Summary (simple placeholder)
const getDashboardSummary = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id });

    if (invoices.length === 0) {
      return res.status(200).json({
        insights: ["No invoice data available to generate insights."],
      });
    }

    // Process and summarize data
    const totalInvoices = invoices.length;

    const paidInvoices = invoices.filter(inv => inv.status === "Paid");
    const unpaidInvoices = invoices.filter(inv => inv.status !== "Paid");

    const totalRevenue = paidInvoices.reduce(
      (acc, inv) => acc + inv.total,
      0
    );

    const totalOutstanding = unpaidInvoices.reduce(
      (acc, inv) => acc + inv.total,
      0
    );

    const recentInvoices = invoices.slice(0, 5)
      .map(inv => `#${inv.invoiceNumber} - ${inv.status} - $${inv.total}`)
      .join(", ");

    const dataSummary = `
- Total number of invoices: ${totalInvoices}
- Total paid invoices: ${paidInvoices.length}
- Total unpaid/pending invoices: ${unpaidInvoices.length}
- Total revenue from paid invoices: $${totalRevenue.toFixed(2)}
- Total outstanding amount from unpaid/pending invoices: $${totalOutstanding.toFixed(2)}
- Recent invoices (last 5): ${recentInvoices}
`;

    // Send summary (you can also pass this to AI if needed)
    res.status(200).json({
      summary: dataSummary,
      stats: {
        totalInvoices,
        paid: paidInvoices.length,
        unpaid: unpaidInvoices.length,
        revenue: totalRevenue,
        outstanding: totalOutstanding,
      },
    });

  } catch (error) {
    console.error("Error dashboard summary with AI:", error);
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