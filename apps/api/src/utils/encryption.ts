import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // Fallback for dev only
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 */
export function encrypt(text: string): string {
    if (!text) return text;

    // Use a fixed key from env in production, ensuring it's 32 bytes
    // For proper security, ENCRYPTION_KEY must be a 64-char hex string in .env
    const key = Buffer.from(ENCRYPTION_KEY, 'hex').length === 32
        ? Buffer.from(ENCRYPTION_KEY, 'hex')
        : crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string using AES-256-GCM
 */
export function decrypt(text: string): string {
    if (!text) return text;

    try {
        const parts = text.split(':');
        if (parts.length !== 3) {
            // If it's not in our format, return as is (legacy data support)
            return text;
        }

        const [ivHex, authTagHex, encryptedHex] = parts;
        if (!ivHex || !authTagHex || !encryptedHex) return text;

        const key = Buffer.from(ENCRYPTION_KEY, 'hex').length === 32
            ? Buffer.from(ENCRYPTION_KEY, 'hex')
            : crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return text; // Return original on error to be safe, or handle differently
    }
}

/**
 * Hashes a string using SHA-256 (for IP address)
 */
export function hashIp(ip: string): string {
    if (!ip) return ip;
    return crypto.createHash('sha256').update(ip).digest('base64');
}
