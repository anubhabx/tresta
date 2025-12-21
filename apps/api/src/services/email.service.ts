import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export class EmailService {
    /**
     * Send an email using Resend
     */
    static async sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
        // Determine if we should actually send
        const apiKey = process.env.RESEND_API_KEY;
        const hasValidKey = apiKey && apiKey.startsWith('re_') && apiKey !== 're_123456789';
        const shouldSend = process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAILS === 'true' || hasValidKey;

        if (!shouldSend) {
            console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
            return true;
        }

        try {
            const { error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'Tresta <noreply@tresta.net>',
                to,
                subject,
                html,
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
