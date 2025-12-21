import { prisma, Testimonial } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    handlePrismaError,
} from '../lib/errors.js';
import { ResponseHandler } from '../lib/response.js';
import { NotificationService } from '../services/notification.service.js';
import { EmailService } from '../services/email.service.js';
import { NotificationType } from '@workspace/database/prisma';
import { decrypt } from '../utils/encryption.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Request data access/deletion link
 */
export const requestPrivacyAccess = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            throw new BadRequestError("Email is required");
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if we have any data for this email
        const count = await prisma.testimonial.count({
            where: { authorEmail: { equals: normalizedEmail, mode: 'insensitive' } }
        });

        if (count === 0) {
            // For security, don't explicitly say "not found", but in this case we can imply it or just send success to prevent enumeration.
            // However, user specifically asked for "search for testimonials... so that can create a JSON".
            // Let's return success but mention count is 0 in message if needed, or just send email saying "No data found".
            // Best practice: Send email with "No data found" OR "Here is your link".
            // For this MVP, we will throw error if 0 to keep it simple for the user, or return success with 0 count.
            return ResponseHandler.success(res, {
                message: "If we have data linked to this email, you will receive a magic link shortly.",
                data: { email }
            });
        }

        // Generate strict short-lived token (1 hour)
        const token = jwt.sign(
            { email: normalizedEmail, type: 'privacy-access' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In a real app, we would send an email here.
        // For this implementation, we will mock the email sending and return the link in the response (for verification/demo purposes)
        // or log it. The user requested: "Searching for testimonials... create JSON...".
        // "Security: The Data Request Form will send a verification email".

        // We will simulate sending email by logging it and returning it in a specific dev-mode header or response for the user to copy.
        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/privacy/manage?token=${token}`;

        // Send email
        await EmailService.sendEmail({
            to: normalizedEmail,
            subject: 'Your Data Access Link - Tresta',
            html: `
            <h1>Data Access Request</h1>
            <p>You requested access to your data on Tresta.</p>
            <p>Click the link below to view or manage your data:</p>
            <p><a href="${magicLink}">${magicLink}</a></p>
            <p>This link expires in 1 hour.</p>
          `
        });

        // Create a notification for admins that someone requested data? No, that's private.

        return ResponseHandler.success(res, {
            message: "Check your email for the secure access link.",
            // Returning link in dev/demo mode only
            debugLink: process.env.NODE_ENV !== 'production' ? magicLink : undefined
        } as any);

    } catch (error) {
        next(error);
    }
};

/**
 * Get user data (JSON export)
 */
export const getPrivacyData = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new UnauthorizedError("No token provided");

        let payload: any;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            throw new UnauthorizedError("Invalid or expired token");
        }

        if (payload.type !== 'privacy-access') {
            throw new UnauthorizedError("Invalid token type");
        }

        const email = payload.email;

        const testimonials = await prisma.testimonial.findMany({
            where: { authorEmail: { equals: email, mode: 'insensitive' } }
        });

        // Decrypt sensitive data for export
        const exportData = testimonials.map(t => ({
            ...t,
            userAgent: t.userAgent ? decrypt(t.userAgent) : null
            // IP is hashed, we cannot decrypt it, which is good. We return the hash or nothing.
            // Returning hash allows them to see we stored *something* but not the raw IP.
        }));

        return ResponseHandler.success(res, {
            message: "Data retrieved successfully",
            data: {
                email,
                count: exportData.length,
                testimonials: exportData
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete/Anonymize user data
 */
export const deletePrivacyData = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new UnauthorizedError("No token provided");

        let payload: any;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            throw new UnauthorizedError("Invalid or expired token");
        }

        if (payload.type !== 'privacy-access') {
            throw new UnauthorizedError("Invalid token type");
        }

        const email = payload.email;

        // Anonymize data: Set IP/UA to null. 
        // User asked: "replacing the device-print data with null values".
        // We should probably NOT delete the testimonial content itself, just the PII.

        const result = await prisma.testimonial.updateMany({
            where: { authorEmail: { equals: email, mode: 'insensitive' } },
            data: {
                ipAddress: null,
                userAgent: null,
                authorEmail: null, // Remove email link too? "delete data... simple as replacing device-print...".
                // If we remove authorEmail, they can never access it again to delete context.
                // But requirements say "Decline... Submits as Anonymous... No Email".
                // So deletion likely means "Make me anonymous".
                authorAvatar: null,
                authorName: "Anonymous (Redacted)",
                oauthSubject: null,
                isOAuthVerified: false
            }
        });

        return ResponseHandler.success(res, {
            message: "Your personal data has been anonymized.",
            data: {
                processed: result.count
            }
        });

    } catch (error) {
        next(error);
    }
};
