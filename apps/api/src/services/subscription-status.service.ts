export type InternalSubscriptionStatus =
  | "INCOMPLETE"
  | "ACTIVE"
  | "PAST_DUE"
  | "PAUSED"
  | "CANCELED";

const TERMINAL_PROVIDER_STATES = new Set(["cancelled", "completed", "expired"]);
const ACTIVE_PROVIDER_STATES = new Set(["active"]);
const PAST_DUE_PROVIDER_STATES = new Set(["pending", "halted"]);
const PAUSED_PROVIDER_STATES = new Set(["paused"]);
const INCOMPLETE_PROVIDER_STATES = new Set(["created", "authenticated"]);

export const mapProviderStatusToInternal = (
  providerStatus?: string,
): InternalSubscriptionStatus => {
  const normalized = providerStatus?.toLowerCase();

  if (!normalized || INCOMPLETE_PROVIDER_STATES.has(normalized)) {
    return "INCOMPLETE";
  }

  if (ACTIVE_PROVIDER_STATES.has(normalized)) {
    return "ACTIVE";
  }

  if (PAST_DUE_PROVIDER_STATES.has(normalized)) {
    return "PAST_DUE";
  }

  if (PAUSED_PROVIDER_STATES.has(normalized)) {
    return "PAUSED";
  }

  if (TERMINAL_PROVIDER_STATES.has(normalized)) {
    return "CANCELED";
  }

  return "INCOMPLETE";
};

export const mapProviderSignalsToInternal = (
  providerStatus?: string,
  lastInvoiceStatus?: string,
  lastPaymentStatus?: string,
): InternalSubscriptionStatus => {
  const normalizedInvoice = lastInvoiceStatus?.toLowerCase();
  const normalizedPayment = lastPaymentStatus?.toLowerCase();

  const fromProvider = mapProviderStatusToInternal(providerStatus);

  if (fromProvider === "ACTIVE") {
    if (normalizedInvoice === "payment_failed" || normalizedPayment === "failed") {
      return "PAST_DUE";
    }

    return "ACTIVE";
  }

  if (fromProvider === "INCOMPLETE") {
    if (normalizedInvoice === "payment_failed" || normalizedPayment === "failed") {
      return "PAST_DUE";
    }
  }

  return fromProvider;
};
