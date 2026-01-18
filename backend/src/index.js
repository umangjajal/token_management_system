// backend/src/index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
//const { Server } = require("socket.io");

// Models
const User = require("./models/User");

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
const { registerSocketHandlers } = require("./sockets/queueSockets");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);

// ======================
// SOCKET.IO
// ======================
/*const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});*/

const allowedOrigins = [
  "http://localhost:5173",
  "https://token-management-system-eta.vercel.app",
  "https://token-management-system-ev2s0ieou-umang-jajals-projects.vercel.app"
];
// ======================
// GLOBAL MIDDLEWARE
// ======================
app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools & server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Token Management API running"
  });
});

// ======================
// API ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/location", authMiddleware, locationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/master-products", masterProductRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/uploads", express.static("uploads"));

// ======================
// SOCKET CONNECTION
// ======================
/*io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  registerSocketHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});*/

// ======================
// DEFAULT ADMIN CREATION
// ======================
async function ensureAdminExists() {
  const adminEmail = "umangjajal@gmail.com";
  const adminPassword = "Admin@123";

  const exists = await User.findOne({
    email: adminEmail,
    role: "admin"
  });

  if (!exists) {
    const passwordHash = await User.hashPassword(adminPassword);
    await User.create({
      role: "admin",
      name: "Super Admin",
      email: adminEmail,
      passwordHash
    });
    console.log("✅ Default admin created");
  } else {
    console.log("ℹ️ Admin already exists");
  }
}

// ======================
// DATABASE + SERVER
// ======================
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/token_management";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await ensureAdminExists();
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connection error", err);
    process.exit(1);
  });
