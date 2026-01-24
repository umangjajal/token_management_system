const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const shopRoutes = require("./routes/shop");
const tokenRoutes = require("./routes/token");
const locationRoutes = require("./routes/location");
const productRoutes = require("./routes/product");
const masterProductRoutes = require("./routes/masterProduct");
const adminProductRoutes = require("./routes/adminproducts");
const adminAnalyticsRoutes = require("./routes/adminAnalytics");
const cartRoutes = require("./routes/cart");

// Middleware
const { authMiddleware } = require("./middleware/auth");

const app = express();
const server = http.createServer(app);

/* =========================
    ALLOWED ORIGINS
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://token-management-system-eta.vercel.app",
  "https://token-management-system-chi.vercel.app" // Added this from your previous error log
];

/* =========================
    GLOBAL CORS (REFINED)
========================= */
const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow mobile apps, Postman, or curl (no origin)
    if (!origin) return callback(null, true);

    // 2. Exact match check
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Pattern match for Vercel preview deployments (Optional but recommended)
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy block: Origin not allowed"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS to all requests
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

/* =========================
    MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for form-data support
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =========================
    HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ 
    ok: true, 
    message: "Token Management API running",
    timestamp: new Date().toISOString()
  });
});

/* =========================
    ROUTES
========================= */
// Auth is public
app.use("/api/auth", authRoutes);

// Protected routes (Ensure authMiddleware is solid)
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/location", authMiddleware, locationRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);

// Mixed/Public routes (Depending on internal route logic)
app.use("/api/shops", shopRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/products", productRoutes);
app.use("/api/master-products", masterProductRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

/* =========================
    DATABASE + SERVER
========================= */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in environment variables!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
  