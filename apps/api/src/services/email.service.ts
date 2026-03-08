import { Resend } from 'resend';
import {
    assertResendApiKey,
    isRealEmailDeliveryEnabled,
} from '../config/email-delivery.js';
import { logger } from '../lib/logger.js';

let resendClient: Resend | null = null;
const emailServiceLogger = logger.child({ module: 'email-service' });

function getResendClient(): Resend {
    if (!resendClient) {
        resendClient = new Resend(assertResendApiKey());
    }

    return resendClient;
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    /**
     * Send an email using Resend
     */
    static async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
        if (!isRealEmailDeliveryEnabled()) {
            emailServiceLogger.info({ to, subject }, 'Email mock send');
            return true;
        }

        try {
            const resend = getResendClient();
            const { error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'Tresta <noreply@tresta.net>',
                to,
                subject,
                html,
                text,
            });

            if (error) {
                emailServiceLogger.error({ to, subject, error }, 'Failed to send email');
                return false;
            }

            return true;
        } catch (error) {
            emailServiceLogger.error({ to, subject, error }, 'Email service error');
            return false;
        }
    }
}
