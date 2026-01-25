const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

/* =========================
   ENV
========================= */
dotenv.config();

/* =========================
   ROUTES
========================= */
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

/* =========================
   MIDDLEWARE
========================= */
const { authMiddleware } = require("./middleware/auth");

/* =========================
   APP INIT
========================= */
const app = express();
const server = http.createServer(app);

/* =========================
   ALLOWED ORIGINS
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://token-management-system-eta.vercel.app",
  "https://token-management-system-chi.vercel.app"
];

/* =========================
   CORS CONFIG
========================= */
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    console.error("❌ Blocked by CORS:", origin);
    callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

/* =========================
   APPLY MIDDLEWARE
========================= */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Token Management API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/* =========================
   ROUTES
========================= */
// PUBLIC
app.use("/api/auth", authRoutes);

// PROTECTED
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/location", authMiddleware, locationRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);

// PUBLIC / MIXED
app.use("/api/shops", shopRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/products", productRoutes);
app.use("/api/master-products", masterProductRoutes);

// ADMIN
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

/* =========================
   DATABASE + SERVER
========================= */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing");
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
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
