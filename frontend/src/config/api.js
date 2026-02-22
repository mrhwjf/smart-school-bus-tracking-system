const rawApiUrl = import.meta.env.VITE_API_URL || '/api/v1';

export const API_URL = rawApiUrl.replace(/\/+$/, '');

let API_ORIGIN = '';
try {
  const url = new URL(API_URL, window.location.origin);
  API_ORIGIN = `${url.protocol}//${url.host}`;
} catch {
  API_ORIGIN = window.location.origin;
}

export { API_ORIGIN };
