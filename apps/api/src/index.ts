import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import * as dotenv from "dotenv";

import { webhookRouter } from "./routes/webhook.route.ts";
import { publicRouter } from "./routes/public.route.ts";
import { clerkMiddleware } from "@clerk/express";
import { attachUser } from "./middleware/auth.middleware.ts";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.ts";

import { projectRouter } from "./routes/project.route.ts";

dotenv.config();

const app = express();

app.use(helmet.hidePoweredBy());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: "application/json" }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/webhook", webhookRouter);
app.use("/api/public", publicRouter);

app.use("/api/projects", attachUser, projectRouter);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
