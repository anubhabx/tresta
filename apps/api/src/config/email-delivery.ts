export function isRealEmailDeliveryEnabled(): boolean {
  return process.env.ENABLE_REAL_EMAILS === 'true';
}

export function getResendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function assertResendApiKey(): string {
  const key = getResendApiKey();

  if (!key) {
    throw new Error('RESEND_API_KEY is required when ENABLE_REAL_EMAILS=true');
  }

  return key;
}
