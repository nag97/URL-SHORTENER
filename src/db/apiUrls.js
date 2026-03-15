import {
  createShortUrl,
  getUserUrls,
  deleteUrl as localDeleteUrl,
  resolveShortUrl,
  generateShortCode,
} from "../lib/localUrls";

export async function getUrl({ id, user_id }) {
  const urls = getUserUrls(user_id);
  return urls.find((u) => u.id === id) || null;
}

export async function getUrls(user_id) {
  return getUserUrls(user_id);
}

export async function createUrl(data, qrcode) {
  return createShortUrl(data, qrcode);
}

export async function fetchUserUrls(user_id) {
  return getUserUrls(user_id);
}

export async function deleteUrl(shortCode) {
  return localDeleteUrl(shortCode); // ✅ explicit function, not re-export
}

export async function getOriginalUrl(shortCode) {
  return resolveShortUrl(shortCode);
}

export const getLongUrl = getOriginalUrl;

export { generateShortCode };