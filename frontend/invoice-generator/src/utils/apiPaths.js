export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER:       "/api/auth/register",
    LOGIN:          "/api/auth/login",
    GET_PROFILE:    "/api/auth/me",
    UPDATE_PROFILE: "/api/auth/me",
  },
  INVOICE: {
    CREATE_INVOICE:    "/api/invoices/",
    GET_ALL_INVOICES:  "/api/invoices/",
    GET_INVOICE_BY_ID: (id) => `/api/invoices/${id}`,
    UPDATE_INVOICE:    (id) => `/api/invoices/${id}`,
    DELETE_INVOICE:    (id) => `/api/invoices/${id}`,
  },
  AI: {
    PARSE_INVOICE_TEXT:   "/api/ai/parse-text",
    GENERATE_REMINDER:    "/api/ai/generate-reminder",
    GET_DASHBOARD_SUMMARY: "/api/ai/dashboard-summary",
    PARSE_RECURRING:      "/api/ai/parse-recurring",
  },
  RECURRING: {
    CREATE:  "/api/recurring/",
    GET_ALL: "/api/recurring/",
    PAUSE:   (id) => `/api/recurring/${id}/pause`,
    RESUME:  (id) => `/api/recurring/${id}/resume`,
    CANCEL:  (id) => `/api/recurring/${id}/cancel`,
    DELETE:  (id) => `/api/recurring/${id}`,
  },
};