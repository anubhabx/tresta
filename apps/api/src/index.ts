import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import * as dotenv from "dotenv";
import { prisma } from "@workspace/database/prisma";

import { webhookRouter } from "./routes/webhook.route.ts";
import { clerkMiddleware } from "@clerk/express";
import { attachUser } from "./middleware/auth.middleware.ts";

dotenv.config();

const app = express();

app.use(helmet.hidePoweredBy());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: "application/json" }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/webhook", webhookRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
