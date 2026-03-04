const DEFAULT_API_BASE_URL = "http://localhost:8000";

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, "");

export const getApiBaseUrl = (): string => {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (configuredBaseUrl && configuredBaseUrl.trim().length > 0) {
    return normalizeBaseUrl(configuredBaseUrl.trim());
  }

  return DEFAULT_API_BASE_URL;
};

export const getPublicApiBaseUrl = (): string => getApiBaseUrl();

export const getApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};
