# PackMaster Pro 📦
> **Smart Web-Based Packaging Planning and Quotation Platform**

PackMaster Pro streamlines packaging selection for small businesses and e-commerce merchants. Instead of manual phone calls, WhatsApp messages, and confusing quotes, PackMaster Pro empowers users to configure product dimensions, receive Gemini AI recommendations, compare options, view deterministic cost quotations, and track orders in a clean dashboard.

---

## 🚀 Technology Stack

### Frontend (`/client`)
- **React.js 18+ (Pure JavaScript / JSX — No TypeScript)**
- **Vite** — High-performance frontend tooling
- **Tailwind CSS** — Clean, responsive styling matching reference UI
- **Firebase Authentication** — Google Sign-In with ID token extraction
- **Lucide React** — Modern, consistent icons
- **Axios** — RESTful HTTP client with token interceptor

### Backend (`/server`)
- **Node.js & Express.js** — Modular REST API
- **NVIDIA NIM API (`z-ai/glm-5.3`)** — OpenAI-compatible endpoint for packaging engineering analysis
- **Firebase Admin SDK** — Bearer token authentication & authorization middleware

---

## 📁 Project Architecture & Folder Structure

```
PackMaster Pro/
├── client/                          # React Frontend (Vite, JavaScript/JSX)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx        # Google Sign-In & 1-click demo modal
│   │   │   ├── CustomizeModal.jsx   # Tweak dimensions & material
│   │   │   ├── Navbar.jsx           # Responsive header with avatar 'SN'
│   │   │   ├── PackagingPreview.jsx # Live 3D box preview (Screen 3)
│   │   │   └── Stepper.jsx          # 4-step progress bar (Screens 2-4)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Screen 1: Hero & feature cards
│   │   │   ├── PlanWizardPage.jsx   # Screens 2, 3, 4: Multi-step wizard
│   │   │   ├── QuotationPage.jsx    # Screen 5: Packaging plan summary
│   │   │   └── MyOrdersPage.jsx     # Screen 6: Orders & tracking
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with auth interceptor
│   │   │   ├── authService.js       # Firebase Google Sign-In & state
│   │   │   └── planService.js       # Calls backend endpoints
│   │   ├── utils/
│   │   │   ├── firebaseConfig.js    # Firebase Web client setup
│   │   │   └── pricing.js           # Client deterministic math helper
│   │   ├── App.jsx                  # Main router & layout
│   │   ├── index.css                # Tailwind directives & global styling
│   │   └── main.jsx                 # Pure JavaScript entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Express.js Backend (Node.js)
│   ├── config/
│   │   ├── db.js                    # MongoDB connection with Mongoose
│   │   └── firebaseAdmin.js         # Firebase token verification
│   ├── controllers/
│   │   ├── aiController.js          # Gemini packaging recommendation
│   │   └── planController.js        # Quotations & plan persistence
│   ├── middleware/
│   │   └── authMiddleware.js        # Validates Firebase Bearer tokens
│   ├── models/
│   │   └── Plan.js                  # Mongoose Plan & Order schema
│   ├── routes/
│   │   ├── aiRoutes.js              # POST /api/ai/recommend
│   │   └── planRoutes.js            # POST /api/plans, GET /api/plans
│   ├── utils/
│   │   └── calculatePrice.js        # Deterministic mathematical pricing
│   ├── .env.example
│   ├── package.json
│   └── server.js                    # Express server entry point
│
└── README.md
```

---

## ⚡ Step-by-Step Running Guide

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
# Server will run on http://localhost:5000
```

### 2. Start the Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
# App will open on http://localhost:5173
```

---

## 🧠 Viva Presentation Explanations

### 1. How does Authentication work?
1. The user clicks **Get Started** or **Sign In**.
2. Firebase Authentication triggers a popup for **Google Sign-In**.
3. Upon success, Firebase issues a signed **Firebase ID Token (JWT)**.
4. The React client stores this token and sends it in the `Authorization: Bearer <token>` header with every API request.
5. In `server/middleware/authMiddleware.js`, the token is decoded/verified, and the authenticated user's `uid` is attached to `req.user`.

### 2. How does the AI Recommendation work?
1. The user provides product name, category, dimensions (L, W, H), and priorities.
2. The frontend sends these parameters to `POST /api/ai/recommend` without exposing any AI API keys.
3. The Express backend sends a structured engineering prompt to the **NVIDIA NIM OpenAI-compatible endpoint** (`https://integrate.api.nvidia.com/v1/chat/completions`) using model `z-ai/glm-5.3`.
4. The model responds with structured JSON advising the optimal packaging type, ply-thickness, and bulleted engineering reasons.
5. If offline or if the API key is not present, an intelligent heuristic packaging engine guarantees smooth viva demonstrations without crashes.

### 3. How is the Price Calculated?
Instead of allowing AI to arbitrarily guess a price, PackMaster Pro uses a deterministic formula:
- **Surface Area ($m^2$):** $2 \times (L \times W + W \times H + H \times L) / 10,000$
- **Material Multiplier:** Base rate per $m^2$ depending on 3-Ply, 5-Ply, Kraft GSM.
- **Volume Tiers:** 8% discount at 500 units, 15% discount at 1,000 units, 25% discount at 2,000+ units.
- **Formula:** $\text{Unit Price} \times \text{Quantity} = \text{Total Price (₹)}$
