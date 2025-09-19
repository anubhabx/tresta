import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import { ApiError, NotFoundError } from "../lib/errors.ts";
