import axios from 'axios';
import { auth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create axios instance with auth token
 * Server-side only
 */
export async function createApiClient() {
  const { getToken } = await auth();
  const token = await getToken();

  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}

/**
 * Client-side API client
 * Use with useAuth() hook to get token
 */
export function createClientApiClient(token: string | null) {
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}
