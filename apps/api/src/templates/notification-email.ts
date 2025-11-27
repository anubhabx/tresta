import type { Notification, User } from '@workspace/database/prisma';

/**
 * Generate HTML email template for notifications
 * 
 * Features:
 * - Responsive design (mobile-friendly)
 * - Tresta branding
 * - Clear call-to-action button
 * - Unsubscribe link
 * - Accessible markup
 */
export function renderEmailTemplate(
  notification: Notification & { user: User }
): string {
  const appUrl = process.env.APP_URL || 'https://tresta.app';
  const actionLink = notification.link ? `${appUrl}${notification.link}` : null;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${notification.title}</title>
    <style>
      @media (prefers-color-scheme: dark) {
        .email-body { background-color: #1a1a1a !important; }
        .email-container { background-color: #2a2a2a !important; }
        .email-text { color: #e5e5e5 !important; }
        .email-text-muted { color: #a3a3a3 !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;" class="email-body">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;" class="email-body">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" class="email-container">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <h1 style="margin: 0; color: #0070f3; font-size: 28px; font-weight: 700;">Tresta</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600;" class="email-text">${notification.title}</h2>
                <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.6;" class="email-text-muted">${notification.message}</p>
                
                ${actionLink ? `
                  <table cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                    <tr>
                      <td style="border-radius: 6px; background-color: #0070f3;">
                        <a href="${actionLink}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                          View Details
                        </a>
                      </td>
                    </tr>
                  </table>
                ` : ''}
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; text-align: center; border-top: 1px solid: #e5e5e5; background-color: #fafafa;">
                <p style="margin: 0 0 12px; color: #999999; font-size: 14px; line-height: 1.5;">
                  You're receiving this because you have email notifications enabled.
                </p>
                <p style="margin: 0; color: #999999; font-size: 14px;">
                  <a href="${appUrl}/settings/notifications" style="color: #0070f3; text-decoration: none;">Manage preferences</a>
                  &nbsp;•&nbsp;
                  <a href="${appUrl}" style="color: #0070f3; text-decoration: none;">Visit Tresta</a>
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Footer text -->
          <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
            <tr>
              <td style="text-align: center; color: #999999; font-size: 12px; line-height: 1.5;">
                <p style="margin: 0;">
                  © ${new Date().getFullYear()} Tresta. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

/**
 * Generate plain text email template for accessibility and deliverability
 * 
 * Plain text version ensures:
 * - Better deliverability (spam filters prefer multipart emails)
 * - Accessibility for screen readers
 * - Fallback for email clients that don't support HTML
 */
export function renderPlainTextTemplate(
  notification: Notification & { user: User }
): string {
  const appUrl = process.env.APP_URL || 'https://tresta.app';
  const actionLink = notification.link ? `${appUrl}${notification.link}` : null;

  return `
${notification.title}

${notification.message}

${actionLink ? `View Details: ${actionLink}\n` : ''}
---

You're receiving this because you have email notifications enabled.
Manage preferences: ${appUrl}/settings/notifications

© ${new Date().getFullYear()} Tresta. All rights reserved.
  `.trim();
}

/**
 * Generate digest email template for batched notifications
 * 
 * Groups multiple notifications into a single email
 * Sent daily at 9 AM UTC for non-critical notifications
 */
export function renderDigestTemplate(
  user: User,
  notifications: Notification[]
): string {
  const appUrl = process.env.APP_URL || 'https://tresta.app';
  const count = notifications.length;

  // Group notifications by type
  const grouped = notifications.reduce((acc, notif) => {
    if (!acc[notif.type]) {
      acc[notif.type] = [];
    }
    acc[notif.type]?.push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  const notificationRows = Object.entries(grouped).map(([type, notifs]) => {
    const items = notifs.slice(0, 5).map(notif => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e5e5;">
          <h3 style="margin: 0 0 8px; color: #1a1a1a; font-size: 16px; font-weight: 600;">${notif.title}</h3>
          <p style="margin: 0 0 8px; color: #666666; font-size: 14px; line-height: 1.5;">${notif.message}</p>
          ${notif.link ? `
            <a href="${appUrl}${notif.link}" style="color: #0070f3; text-decoration: none; font-size: 14px;">View →</a>
          ` : ''}
        </td>
      </tr>
    `).join('');

    const remaining = notifs.length - 5;
    const remainingRow = remaining > 0 ? `
      <tr>
        <td style="padding: 12px 16px; background-color: #f5f5f5; text-align: center;">
          <p style="margin: 0; color: #666666; font-size: 14px;">
            + ${remaining} more ${type.toLowerCase().replace(/_/g, ' ')} notification${remaining > 1 ? 's' : ''}
          </p>
        </td>
      </tr>
    ` : '';

    return items + remainingRow;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Digest - ${count} update${count > 1 ? 's' : ''}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <h1 style="margin: 0; color: #0070f3; font-size: 28px; font-weight: 700;">Tresta</h1>
                <p style="margin: 12px 0 0; color: #666666; font-size: 16px;">Your Daily Digest</p>
              </td>
            </tr>
            
            <!-- Summary -->
            <tr>
              <td style="padding: 30px 40px 20px;">
                <h2 style="margin: 0 0 8px; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                  You have ${count} update${count > 1 ? 's' : ''}
                </h2>
                <p style="margin: 0; color: #666666; font-size: 14px;">
                  Here's what happened with your projects
                </p>
              </td>
            </tr>
            
            <!-- Notifications -->
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${notificationRows}
                </table>
              </td>
            </tr>
            
            <!-- View All Button -->
            <tr>
              <td style="padding: 30px 40px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="border-radius: 6px; background-color: #0070f3;">
                      <a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                        View All Notifications
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #e5e5e5; background-color: #fafafa;">
                <p style="margin: 0 0 12px; color: #999999; font-size: 14px;">
                  You're receiving this daily digest because you have email notifications enabled.
                </p>
                <p style="margin: 0; color: #999999; font-size: 14px;">
                  <a href="${appUrl}/settings/notifications" style="color: #0070f3; text-decoration: none;">Manage preferences</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

/**
 * Generate plain text digest template
 */
export function renderPlainTextDigest(
  user: User,
  notifications: Notification[]
): string {
  const appUrl = process.env.APP_URL || 'https://tresta.app';
  const count = notifications.length;

  const notificationList = notifications.slice(0, 10).map((notif, index) => {
    return `${index + 1}. ${notif.title}
   ${notif.message}
   ${notif.link ? `View: ${appUrl}${notif.link}` : ''}
`;
  }).join('\n');

  const remaining = notifications.length - 10;

  return `
Your Daily Digest - ${count} update${count > 1 ? 's' : ''}

Here's what happened with your projects:

${notificationList}
${remaining > 0 ? `\n+ ${remaining} more notification${remaining > 1 ? 's' : ''}\n` : ''}
View all: ${appUrl}/dashboard

---

You're receiving this daily digest because you have email notifications enabled.
Manage preferences: ${appUrl}/settings/notifications

© ${new Date().getFullYear()} Tresta. All rights reserved.
  `.trim();
}
