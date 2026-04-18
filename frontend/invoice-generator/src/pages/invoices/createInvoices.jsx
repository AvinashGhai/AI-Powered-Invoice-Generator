// CreateInvoice.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Plus, Trash2, FileText, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { useAuth } from "../../context/authContext";

const EMPTY_ITEM = { name: "", quantity: 1, unitPrice: 0, taxPercent: 0, total: 0 };

const CreateInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth() || {};

  const existingInvoice = location.state?.invoiceData || null;

  const [formData, setFormData] = useState(
    existingInvoice || {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billFrom: {
        businessName: user?.businessName ?? "",
        email: user?.email ?? "",
        address: user?.address ?? "",
        phone: user?.phone ?? "",
      },
      billTo: { clientName: "", email: "", address: "", phone: "" },
      items: [{ ...EMPTY_ITEM }],
      notes: "",
      paymentTerms: "Net 15",
    }
  );

  const [loading, setLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(!existingInvoice);

  useEffect(() => {
    const aiData = location.state?.aiData;

    if (aiData) {
      setFormData((prev) => ({
        ...prev,
        billTo: {
          clientName: aiData.clientName || "",
          email: aiData.email || "",
          address: aiData.address || "",
          phone: "",
        },
        items: aiData.items || [{ ...EMPTY_ITEM }],
      }));
    }

    if (existingInvoice) {
      setFormData({
        ...existingInvoice,
        invoiceDate: moment(existingInvoice.invoiceDate).format("YYYY-MM-DD"),
        dueDate: moment(existingInvoice.dueDate).format("YYYY-MM-DD"),
      });
    } else {
      const generateNewInvoiceNumber = async () => {
        setIsGeneratingNumber(true);
        try {
          const response = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
          const invoices = Array.isArray(response.data) ? response.data : [];
          let maxNum = 0;
          invoices.forEach((inv) => {
            const num = parseInt(inv.invoiceNumber?.split("-")[1]);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          });
          const newInvoiceNumber = `INV-${String(maxNum + 1).padStart(3, "0")}`;
          setFormData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }));
        } catch (error) {
          console.error("Failed to generate invoice number", error);
          setFormData((prev) => ({
            ...prev,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          }));
        } finally {
          setIsGeneratingNumber(false);
        }
      };
      generateNewInvoiceNumber();
    }
  }, []);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleInputChange = (e, section, index) => {
    const { name, value } = e.target;

    if (section === "items") {
      const updatedItems = [...formData.items];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      setFormData({ ...formData, items: updatedItems });
    } else if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { ...EMPTY_ITEM }] });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: updatedItems.length ? updatedItems : [{ ...EMPTY_ITEM }],
    });
  };

  /* ── Totals ───────────────────────────────────────────── */
  const { subtotal, taxTotal, total } = (() => {
    let subtotal = 0, taxTotal = 0;
    formData.items.forEach((item) => {
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      subtotal += itemTotal;
      taxTotal += itemTotal * ((Number(item.taxPercent) || 0) / 100);
    });
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  })();

  /* ── Submit ───────────────────────────────────────────── */
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.dueDate) { toast.error("Please select a due date."); return; }
  if (!formData.billTo.clientName) { toast.error("Please enter a client name."); return; }
  if (!formData.billFrom.businessName) { toast.error("Please enter your business name."); return; }
  if (formData.items.some((item) => !item.name)) { toast.error("Please fill in all item names."); return; }

  setLoading(true);
  try {
    const payload = {
      invoiceNumber:  formData.invoiceNumber,
      invoiceDate:    formData.invoiceDate,
      dueDate:        formData.dueDate,
      billFrom:       formData.billFrom,
      billTo:         formData.billTo,
      items:          formData.items,   // controller handles mapping
      notes:          formData.notes,
      paymentTerms:   formData.paymentTerms,
    };

    if (existingInvoice) {
      await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(existingInvoice._id), payload);
      toast.success("Invoice updated successfully!");
    } else {
      await axiosInstance.post(API_PATHS.INVOICE.CREATE_INVOICE, payload);
      toast.success("Invoice created successfully!");
    }
    navigate("/invoices");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  /* ── Styles ───────────────────────────────────────────── */
  const fmt = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {existingInvoice ? "Edit Invoice" : "Create Invoice"}
            </h2>
            <p className="text-sm text-gray-400">
              {isGeneratingNumber ? "Generating number…" : formData.invoiceNumber}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || isGeneratingNumber}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <FileText className="w-4 h-4" />
          }
          {existingInvoice ? "Update Invoice" : "Save Invoice"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Invoice Meta */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Invoice Number</label>
              <input
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                placeholder={isGeneratingNumber ? "Generating…" : "INV-001"}
                disabled={isGeneratingNumber}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Bill From / To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Bill From */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Bill From</h3>
            <div className="space-y-3">
              {[
                { label: "Business Name", name: "businessName", placeholder: "Your Business"     },
                { label: "Email",         name: "email",        placeholder: "you@example.com"   },
                { label: "Address",       name: "address",      placeholder: "123 Main St"       },
                { label: "Phone",         name: "phone",        placeholder: "+1 (555) 000-0000" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className={labelCls}>{label}</label>
                  <input
                    name={name}
                    value={formData.billFrom[name] || ""}
                    onChange={(e) => handleInputChange(e, "billFrom")}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Bill To</h3>
            <div className="space-y-3">
              {[
                { label: "Client Name", name: "clientName", placeholder: "Client Business"   },
                { label: "Email",       name: "email",      placeholder: "client@example.com"},
                { label: "Address",     name: "address",    placeholder: "456 Client Ave"    },
                { label: "Phone",       name: "phone",      placeholder: "+1 (555) 000-0000" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className={labelCls}>{label}</label>
                  <input
                    name={name}
                    value={formData.billTo[name] || ""}
                    onChange={(e) => handleInputChange(e, "billTo")}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Line Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          <div className="p-5 space-y-3">
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-1">
              {["Item Name", "Qty", "Unit Price", "Tax %", "Total", ""].map((h, i) => (
                <div
                  key={i}
                  className={`text-[11px] font-semibold text-gray-400 uppercase tracking-wide
                    ${i === 0 ? "col-span-4" : i === 4 ? "col-span-2 text-right" : i === 5 ? "col-span-1" : "col-span-2"}`}
                >
                  {h}
                </div>
              ))}
            </div>

            {formData.items.map((item, index) => {
              const lineTotal =
                (Number(item.quantity) || 0) *
                (Number(item.unitPrice) || 0) *
                (1 + (Number(item.taxPercent) || 0) / 100);
              return (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-gray-50/50 border border-gray-100"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      name="name"
                      value={item.name}
                      onChange={(e) => handleInputChange(e, "items", index)}
                      placeholder="Item description"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(e, "items", index)}
                      min="1"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      name="unitPrice"
                      value={item.unitPrice}
                      onChange={(e) => handleInputChange(e, "items", index)}
                      min="0"
                      step="0.01"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      name="taxPercent"
                      value={item.taxPercent}
                      onChange={(e) => handleInputChange(e, "items", index)}
                      min="0"
                      max="100"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-2 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {fmt(lineTotal)}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/30">
            <div className="max-w-xs ml-auto space-y-2">
              {[
                { label: "Subtotal", value: fmt(subtotal) },
                { label: "Tax",      value: fmt(taxTotal)  },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm text-gray-500">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Payment Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional notes for the client…"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Payment Terms</label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              className={inputCls}
            >
              {["Net 7", "Net 15", "Net 30", "Net 60", "Due on Receipt"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CreateInvoice;