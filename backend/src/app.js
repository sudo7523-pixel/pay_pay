import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import merchantRoutes from "./routes/merchant.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import eventRoutes from "./routes/event.routes.js";
import sorobanRoutes from "./routes/soroban.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import { config, validateConfig } from "./config/index.js";
import { startEventSync } from "./blockchain/event-sync.service.js";

const app = express();

validateConfig();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "Backend Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/pay", paymentRoutes);
app.use("/api/payment", transactionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/soroban", sorobanRoutes);
app.use("/api/customer", customerRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
});

connectDB();

setTimeout(() => {
  try {
    startEventSync();
    console.log("Soroban event sync service started");
  } catch (error) {
    console.error("Failed to start event sync service:", error.message);
  }
}, 1000);

export default app;
