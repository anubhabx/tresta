import axios from "axios";

type HttpErrorPayload = {
  message?: string;
  error?: {
    message?: string;
    code?: string;
  };
  code?: string;
};

export const getHttpErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (axios.isAxiosError<HttpErrorPayload>(error)) {
    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
