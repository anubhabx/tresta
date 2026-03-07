import type { Notification, User } from "@workspace/database/prisma";

function toAbsoluteUrl(baseUrl: string, link?: string | null): string | null {
  if (!link || link.trim().length === 0) {
    return null;
  }

  const trimmed = link.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${normalizedBase}${normalizedPath}`;
}

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
export function renderEmailTemplate(notification: Notification): string {
  const appUrl = process.env.APP_URL || "https://tresta.app";
  const actionLink = toAbsoluteUrl(appUrl, notification.link);

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
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; color: #ffffff;" class="email-body">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4);" class="email-container">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 20px; text-align: left; border-bottom: 1px solid #1f1f1f;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
                  Tresta
                </h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: -0.01em;" class="email-text">${notification.title}</h2>
                <p style="margin: 0 0 32px; color: #a1a1aa; font-size: 15px; line-height: 1.6;" class="email-text-muted">${notification.message}</p>
                
                ${
                  actionLink
                    ? `
                  <table cellpadding="0" cellspacing="0" style="margin: 0;">
                    <tr>
                      <td style="border-radius: 6px; background-color: #ffffff;">
                        <a href="${actionLink}" style="display: inline-block; padding: 12px 24px; color: #000000; text-decoration: none; font-weight: 500; font-size: 14px;">
                          View Details
                        </a>
                      </td>
                    </tr>
                  </table>
                `
                    : ""
                }
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; text-align: left; border-top: 1px solid #1f1f1f; background-color: #050505;">
                <p style="margin: 0 0 12px; color: #71717a; font-size: 13px; line-height: 1.5;">
                  You're receiving this because you have email notifications enabled.
                </p>
                <p style="margin: 0; color: #71717a; font-size: 13px;">
                  <a href="${appUrl}/account?tab-general" style="color: #d4d4d8; text-decoration: underline;">Manage preferences</a>
                  &nbsp;•&nbsp;
                  <a href="${appUrl}" style="color: #d4d4d8; text-decoration: underline;">Visit Tresta</a>
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Footer text -->
          <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
            <tr>
              <td style="text-align: center; color: #52525b; font-size: 12px; line-height: 1.5;">
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
export function renderPlainTextTemplate(notification: Notification): string {
  const appUrl = process.env.APP_URL || "https://tresta.app";
  const actionLink = toAbsoluteUrl(appUrl, notification.link);

  return `
${notification.title}

${notification.message}

${actionLink ? `View Details: ${actionLink}\n` : ""}
---

You're receiving this because you have email notifications enabled.
Manage preferences: ${appUrl}/account?tab-general

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
  notifications: Notification[],
): string {
  const appUrl = process.env.APP_URL || "https://tresta.app";
  const count = notifications.length;

  // Group notifications by type
  const grouped = notifications.reduce(
    (acc, notif) => {
      if (!acc[notif.type]) {
        acc[notif.type] = [];
      }
      acc[notif.type]?.push(notif);
      return acc;
    },
    {} as Record<string, Notification[]>,
  );

  const notificationRows = Object.entries(grouped)
    .map(([type, notifs]) => {
      const items = notifs
        .slice(0, 5)
        .map(
          (notif) => `
      <tr>
        <td style="padding: 24px 0; border-bottom: 1px solid #1f1f1f;">
          <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 16px; font-weight: 500;">${notif.title}</h3>
          <p style="margin: 0 0 16px; color: #a1a1aa; font-size: 14px; line-height: 1.5;">${notif.message}</p>
          ${
            toAbsoluteUrl(appUrl, notif.link)
              ? `
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius: 4px; border: 1px solid #3f3f46; background-color: #18181b;">
                  <a href="${toAbsoluteUrl(appUrl, notif.link)}" style="display: inline-block; padding: 8px 16px; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500;">View Details</a>
                </td>
              </tr>
            </table>
          `
              : ""
          }
        </td>
      </tr>
    `,
        )
        .join("");

      const remaining = notifs.length - 5;
      const remainingRow =
        remaining > 0
          ? `
      <tr>
        <td style="padding: 16px 0; text-align: left;">
          <p style="margin: 0; color: #71717a; font-size: 14px;">
            + ${remaining} more ${type.toLowerCase().replace(/_/g, " ")} notification${remaining > 1 ? "s" : ""}
          </p>
        </td>
      </tr>
    `
          : "";

      return items + remainingRow;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Digest - ${count} update${count > 1 ? "s" : ""}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; color: #ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 20px; text-align: left; border-bottom: 1px solid #1f1f1f;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Tresta</h1>
                <p style="margin: 12px 0 0; color: #a1a1aa; font-size: 15px;">Your Daily Digest</p>
              </td>
            </tr>
            
            <!-- Summary -->
            <tr>
              <td style="padding: 40px 40px 10px;">
                <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 20px; font-weight: 500; letter-spacing: -0.01em;">
                  You have ${count} update${count > 1 ? "s" : ""}
                </h2>
                <p style="margin: 0; color: #a1a1aa; font-size: 15px;">
                  Here's what happened with your projects
                </p>
              </td>
            </tr>
            
            <!-- Notifications -->
            <tr>
              <td style="padding: 0 40px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${notificationRows}
                </table>
              </td>
            </tr>
            
            <!-- View All Button -->
            <tr>
              <td style="padding: 40px;">
                <table cellpadding="0" cellspacing="0" style="margin: 0;">
                  <tr>
                    <td style="border-radius: 6px; background-color: #ffffff;">
                      <a href="${appUrl}/dashboard" style="display: inline-block; padding: 12px 24px; color: #000000; text-decoration: none; font-weight: 500; font-size: 14px;">
                        View All Notifications
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; text-align: left; border-top: 1px solid #1f1f1f; background-color: #050505;">
                <p style="margin: 0 0 12px; color: #71717a; font-size: 13px; line-height: 1.5;">
                  You're receiving this daily digest because you have email notifications enabled.
                </p>
                <p style="margin: 0; color: #71717a; font-size: 13px;">
                  <a href="${appUrl}/account?tab-gneral" style="color: #d4d4d8; text-decoration: underline;">Manage preferences</a>
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Footer text -->
          <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
            <tr>
              <td style="text-align: center; color: #52525b; font-size: 12px; line-height: 1.5;">
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
 * Generate plain text digest template
 */
export function renderPlainTextDigest(
  user: User,
  notifications: Notification[],
): string {
  const appUrl = process.env.APP_URL || "https://tresta.app";
  const count = notifications.length;

  const notificationList = notifications
    .slice(0, 10)
    .map((notif, index) => {
      const absoluteLink = toAbsoluteUrl(appUrl, notif.link);
      return `${index + 1}. ${notif.title}
   ${notif.message}
   ${absoluteLink ? `View: ${absoluteLink}` : ""}
`;
    })
    .join("\n");

  const remaining = notifications.length - 10;

  return `
Your Daily Digest - ${count} update${count > 1 ? "s" : ""}

Here's what happened with your projects:

${notificationList}
${remaining > 0 ? `\n+ ${remaining} more notification${remaining > 1 ? "s" : ""}\n` : ""}
View all: ${appUrl}/dashboard

---

You're receiving this daily digest because you have email notifications enabled.
Manage preferences: ${appUrl}/account?tab-general

© ${new Date().getFullYear()} Tresta. All rights reserved.
  `.trim();
}
