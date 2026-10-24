/**
 * Central API URL helper.
 * - Same-origin deployment (single service on Render/Railway): "/api/..." relative, no config needed.
 * - Split deployment (Vercel frontend + Render API): set VITE_API_BASE_URL="https://<render-app>.onrender.com"
 *   in the frontend build env — all API calls route to the backend origin.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';

export function apiUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
