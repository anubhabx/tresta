import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

export interface GoogleTokenPayload {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
  email_verified: boolean;
}

/**
 * Verify Google ID token and return payload
 * @param token - Google ID token from frontend
 * @returns Verified token payload or null if invalid
 */
export async function verifyGoogleIdToken(
  token: string
): Promise<GoogleTokenPayload | null> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return null;
    }

    // Ensure email is verified
    if (!payload.email_verified) {
      console.warn("Google email not verified:", payload.email);
      return null;
    }

    return {
      email: payload.email || "",
      name: payload.name || "",
      picture: payload.picture || "",
      sub: payload.sub,
      email_verified: payload.email_verified,
    };
  } catch (error) {
    console.error("Failed to verify Google ID token:", error);
    return null;
  }
}
