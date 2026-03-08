import { verifyWebhook } from "@clerk/express/webhooks";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "@workspace/database/prisma";
import {
  blobStorageService,
  StorageDirectory,
} from '../services/blob-storage.service.js';
import { logger } from '../lib/logger.js';

const clerkWebhookLogger = logger.child({ module: 'clerk-webhook' });

export const syncUserToDB = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    });

    if (
      evt.type !== "user.created" &&
      evt.type !== "user.updated" &&
      evt.type !== "user.deleted"
    ) {
      res.status(200).send("Event type not handled");
      return;
    }

  clerkWebhookLogger.info({ eventType: evt.type }, 'Clerk webhook event received');

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses.find(
        (email) => email.id === evt.data.primary_email_address_id,
      )?.email_address;

      if (!email) {
        res.status(400).send("No primary email found");
        return;
      }

      // Sync avatar from Clerk to Azure Blob Storage
      let avatarUrl: string | null = null;
      if (image_url) {
        try {
          avatarUrl = await blobStorageService.uploadFromUrl(
            image_url,
            StorageDirectory.AVATARS,
            id,
          );
          clerkWebhookLogger.info({ userId: id, avatarUrl }, 'Avatar synced for user');
        } catch (error) {
          clerkWebhookLogger.error({ userId: id, error }, 'Error syncing avatar');
          // Continue even if avatar sync fails
        }
      }

      try {
        await prisma.user.upsert({
          where: { id },
          update: {
            email,
            firstName: first_name || null,
            lastName: last_name || null,
            avatar: avatarUrl || undefined,
            updatedAt: new Date(),
          },
          create: {
            id,
            email,
            firstName: first_name || null,
            lastName: last_name || null,
            avatar: avatarUrl || null,
          },
        });
      } catch (error) {
        clerkWebhookLogger.error({ userId: id, error }, 'Error syncing user to DB');
        res.status(500).send("Error syncing user to DB");
        return;
      }
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;

      try {
        await prisma.user.delete({
          where: { id },
        });
      } catch (error) {
        clerkWebhookLogger.error({ userId: id, error }, 'Error deleting user from DB');
        res.status(500).send("Error deleting user from DB");
        return;
      }
    }

    res.status(200).send("User synced to DB");
  } catch (error) {
    clerkWebhookLogger.error({ error }, 'Webhook verification failed');
    res.status(400).send("Webhook verification failed");
  }
};
