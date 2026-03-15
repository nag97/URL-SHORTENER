// Local URL storage using localStorage
// Manages short URLs without external database

/**
 * Generate a random short code
 * Returns a 6-character base62 string
 */
function generateShortCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Create a new short URL
 */
export async function createUrl(
  { title, longUrl, customUrl, user_id },
  qrcode,
) {
  if (!longUrl || !user_id) {
    throw new Error("longUrl and user_id are required");
  }

  // Get existing URLs
  const urls = JSON.parse(localStorage.getItem("urls") || "[]");

  // Check if custom URL is already taken
  if (customUrl) {
    if (urls.find((u) => u.custom_url === customUrl)) {
      throw new Error("Custom URL already taken");
    }
  }

  // Generate short code
  let short_url = customUrl || generateShortCode();

  // Ensure unique
  while (
    urls.find((u) => u.short_url === short_url || u.custom_url === short_url)
  ) {
    short_url = generateShortCode();
  }

  // Convert blob to base64 data URL for storage and display
  let qrDataUrl = null;
  if (qrcode) {
    if (qrcode instanceof Blob) {
      qrDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(qrcode);
      });
    } else {
      // Already a string (base64 or data URL)
      qrDataUrl = qrcode;
    }
  }

  // Create URL entry
  const newUrl = {
    id: generateId(),
    user_id,
    title: title || new URL(longUrl).hostname,
    original_url: longUrl,
    short_url,
    custom_url: customUrl || null,
    qr: qrDataUrl,
    created_at: new Date().toISOString(),
    clicks: 0,
  };

  // Save URL
  urls.push(newUrl);
  localStorage.setItem("urls", JSON.stringify(urls));

  return newUrl;
}

/**
 * Get all URLs for a user
 */
export async function getUrls(user_id) {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const urls = JSON.parse(localStorage.getItem("urls") || "[]");
  return urls.filter((u) => u.user_id === user_id);
}

/**
 * Get a single URL by ID
 */
export async function getUrl({ id, user_id }) {
  if (!id || !user_id) {
    throw new Error("id and user_id are required");
  }

  const urls = JSON.parse(localStorage.getItem("urls") || "[]");
  const url = urls.find((u) => u.id === id && u.user_id === user_id);

  if (!url) {
    throw new Error("URL not found");
  }

  return url;
}

/**
 * Resolve a short URL to its original URL
 */
export async function getLongUrl(shortCode) {
  const urls = JSON.parse(localStorage.getItem("urls") || "[]");
  const url = urls.find(
    (u) => u.short_url === shortCode || u.custom_url === shortCode,
  );

  if (!url) {
    return null;
  }

  return {
    id: url.id,
    original_url: url.original_url,
  };
}

/**
 * Delete a URL
 */
export async function deleteUrl(id) {
  if (!id) {
    throw new Error("id is required");
  }

  let urls = JSON.parse(localStorage.getItem("urls") || "[]");
  const urlToDelete = urls.find((u) => u.id === id);

  if (!urlToDelete) {
    throw new Error("URL not found");
  }

  // Remove from URLs list
  urls = urls.filter((u) => u.id !== id);
  localStorage.setItem("urls", JSON.stringify(urls));

  return { success: true };
}

/**
 * Update click count for a URL
 */
export async function recordClick(id) {
  const urls = JSON.parse(localStorage.getItem("urls") || "[]");
  const url = urls.find((u) => u.id === id);

  if (!url) {
    throw new Error("URL not found");
  }

  url.clicks = (url.clicks || 0) + 1;
  localStorage.setItem("urls", JSON.stringify(urls));

  return { success: true };
}
