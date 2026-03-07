import { Resend } from 'resend';
import {
    assertResendApiKey,
    isRealEmailDeliveryEnabled,
} from '../config/email-delivery.js';

let resendClient: Resend | null = null;

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
            console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
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
                console.error('Failed to send email:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Email service error:', error);
            return false;
        }
    }
}
