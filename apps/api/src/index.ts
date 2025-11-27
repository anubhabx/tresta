import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { webhookRouter } from './routes/webhook.route.js';
import { publicRouter } from './routes/public.route.js';
import { clerkMiddleware } from "@clerk/express";
import { attachUser } from './middleware/auth.middleware.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware.js';
import { dynamicCors } from './middleware/cors.middleware.js';

import { projectRouter } from './routes/project.route.js';
import { mediaRouter } from './routes/media.route.js';
import { widgetRouter } from './routes/widget.route.js';
import apiKeyRouter from './routes/api-key.route.js';
import adminRouter from './routes/admin/index.js';
import notificationsRouter from './routes/notifications.route.js';
import ablyRouter from './routes/ably/token.route.js';
import testRouter from './routes/test.route.js';
import widgetAnalyticsRouter from './routes/widget-analytics.route.js';
import { blobStorageService } from './services/blob-storage.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet.hidePoweredBy());
// Apply dynamic CORS (checks path and applies appropriate policy)
app.use(dynamicCors);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: "application/json" }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).send(process.env.REDIS_URL);
});

// Serve widget script (public, CDN-ready with aggressive caching)
// Note: __dirname will be in apps/api/dist when compiled, so go up to workspace root
const widgetPath = path.resolve(__dirname, "../../../packages/widget/dist");
console.log("Widget path:", widgetPath);
app.use(
  "/widget",
  express.static(widgetPath, {
    maxAge: "1y", // 1 year cache for versioned widget file
    immutable: true,
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// Health check and admin routes (before other routes)
app.use("/", adminRouter);

// Webhook routes
app.use("/api/webhook", webhookRouter);

// Public routes (dynamic CORS handles this automatically)
app.use("/api/public", publicRouter);

// Protected routes (use global restrictive CORS)
app.use("/api/projects", attachUser, projectRouter);
app.use("/api/projects", apiKeyRouter); // API key routes (has its own auth middleware)
app.use("/api/media", attachUser, mediaRouter);
app.use("/api/widgets", widgetRouter);
app.use("/api/widget-analytics", widgetAnalyticsRouter);
app.use("/api/notifications", attachUser, notificationsRouter);
app.use("/api/ably", attachUser, ablyRouter);

// Test routes (remove in production)
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", attachUser, testRouter);
}

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// Initialize Azure Blob Storage container and CORS
blobStorageService
  .ensureContainerExists()
  .then(async () => {
    // console.log("✓ Azure Blob Storage container initialized");
    // Configure CORS for direct browser uploads
    await blobStorageService.configureCORS();
  })
  .catch((error) => {
    console.error("✗ Failed to initialize Azure Blob Storage:", error);
  });

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown handlers
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');

    try {
      // Import disconnect functions (dynamic import to avoid circular dependencies)
      const { disconnectPrisma } = await import('@workspace/database/prisma');
      const { disconnectRedis } = await import('./lib/redis.js');

      // Disconnect from databases
      await disconnectPrisma();
      await disconnectRedis();

      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
