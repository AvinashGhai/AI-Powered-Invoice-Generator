# AI-Powered Invoice Generator
 
A full-stack invoice management platform that uses AI to turn plain-English descriptions into structured, professional invoices — plus recurring billing, AI-generated payment reminders, and a smart dashboard with data-driven insights.
 
**Live demo:** [ai-powered-invoice-generator-jx5c.vercel.app](https://ai-powered-invoice-generator-jx5c.vercel.app)
 
---

Screenshots
[Home Page]
<img width="1200" height="700" alt="image" src="https://github.com/user-attachments/assets/1e459956-02f5-4a2a-ad6f-d576c8686f09" />


[DashBoard]
<img width="1200" height="700" alt="image" src="https://github.com/user-attachments/assets/5ea8c61c-4e5e-43a1-ad34-c030dfeb76b6" />


[Create Invoice]
<img width="1200" height="700" alt="image" src="https://github.com/user-attachments/assets/5d30dabf-9f36-47c8-8d13-3c3f71b0f39c" />


[Profile Page]
<img width="1200" height="700" alt="image" src="https://github.com/user-attachments/assets/7a5f5914-e9c6-4c06-9a8f-47ae257237a0" />


[ALL Invoices]
<img width="2524" height="1102" alt="image" src="https://github.com/user-attachments/assets/178ac8c6-d1f7-40fd-af1a-7a3bbd9de977" />


## Features
 
- **AI Invoice Generation** — describe an invoice in plain text ("Invoice for John Smith at Acme Corp for 10 hours of web design at $150/hour, due in 30 days") and have it parsed into a structured invoice automatically.
- **AI Payment Reminders** — generate professional, personalized reminder emails for overdue or upcoming payments in one click.
- **AI Dashboard Insights** — data-driven, plain-English insights about revenue, collection rate, overdue invoices, and top clients, computed from real invoice data.
- **Recurring Invoices** — set up monthly/yearly recurring billing per client, with pause, resume, and cancel controls, powered by a scheduled cron job.
- **PDF Export** — download any invoice as a polished PDF.
- **Authentication** — secure JWT-based auth with protected routes.
- **Responsive UI** — built with Tailwind CSS and Framer Motion for smooth, modern interactions.
---
 
## Tech Stack
 
**Frontend**
- React + Vite
- Tailwind CSS
- Framer Motion
- Axios
**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- node-cron (recurring invoice scheduling)
**AI**
- [Groq](https://groq.com/) — `llama-3.3-70b-versatile`, with JSON-mode structured output for reliable parsing
**Deployment**
- Frontend: [Vercel](https://vercel.com/)
- Backend: [Render](https://render.com/)
- Database: [MongoDB Atlas](https://www.mongodb.com/atlas)
---
 
## Architecture
 
```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│  React Frontend │  HTTP  │  Express Backend  │  ODM   │  MongoDB Atlas  │
│   (Vercel)      │ ─────► │    (Render)       │ ─────► │                 │
└─────────────────┘        └────────┬──────────┘        └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Groq LLM API   │
                            │ (JSON-mode calls)│
                            └─────────────────┘
```
 
---
 
## Getting Started
 
### Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string
- A [Groq API key](https://console.groq.com/keys)
### 1. Clone the repo
```bash
git clone https://github.com/AvinashGhai/AI-Powered-Invoice-Generator.git
cd AI-Powered-Invoice-Generator
```
 
### 2. Backend setup
```bash
cd backend
npm install
```
 
Create a `.env` file inside `backend/`:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```
 
Run the backend:
```bash
nodemon server.js
```
 
### 3. Frontend setup
```bash
cd frontend/invoice-generator
npm install
npm run dev
```
 
The app should now be running locally, with the frontend on Vite's default port and the backend on `PORT` from your `.env`.
 
---
 
## API Overview
 
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | — |
| POST | `/api/auth/login` | Log in | — |
| GET/PUT | `/api/auth/me` | Get / update profile | ✅ |
| GET/POST | `/api/invoices` | List / create invoices | ✅ |
| GET/PUT/DELETE | `/api/invoices/:id` | Get / update / delete an invoice | ✅ |
| POST | `/api/ai/parse-text` | Parse plain text into a structured invoice | ✅ |
| POST | `/api/ai/generate-reminder` | Generate an AI payment reminder email | ✅ |
| GET | `/api/ai/dashboard-summary` | Get AI-generated dashboard insights | ✅ |
| POST | `/api/ai/parse-recurring` | Parse plain text into a recurring schedule | ✅ |
| GET/POST | `/api/recurring` | List / create recurring invoices | ✅ |
| PUT | `/api/recurring/:id/pause` \| `/resume` \| `/cancel` | Manage a recurring invoice's state | ✅ |
| DELETE | `/api/recurring/:id` | Delete a recurring invoice | ✅ |
 
---
 
## Project Structure
 
```
AI-Powered-Invoice-Generator/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/      # Route logic (auth, invoices, AI, recurring)
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/             # Express routers
│   └── server.js
└── frontend/
    └── invoice-generator/
        ├── src/
        │   ├── components/  # Reusable UI components
        │   ├── pages/         # Route-level pages
        │   └── utils/          # Axios instance, API paths, helpers
        └── vercel.json          # SPA routing rewrite for Vercel
```
 
---
 
## Roadmap
 
- [ ] Payment-risk scoring for overdue invoices
- [ ] CORS restricted to production domain
- [ ] httpOnly cookie-based auth (instead of localStorage JWT)
- [ ] Natural-language invoice search/filtering
---
 
 
## Author
 
**Avinash Ghai**
[GitHub](https://github.com/AvinashGhai)

