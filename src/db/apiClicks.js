const CLICKS_KEY = "clicks";

function getAllClicks() {
  return JSON.parse(localStorage.getItem(CLICKS_KEY)) || [];
}

function setAllClicks(clicks) {
  localStorage.setItem(CLICKS_KEY, JSON.stringify(clicks));
}

// Store a click event for a short URL
export async function storeClicks({ url_id, country = "Unknown", device = "Unknown" }) {
  const clicks = getAllClicks();
  const click = {
    id: Date.now().toString(),
    url_id,
    country,
    device,
    createdAt: new Date().toISOString(),
  };
  clicks.push(click);
  setAllClicks(clicks);
  return true;
}

// Get all clicks for a single URL by url_id
export async function getUrlClicks(url_id) {
  return getAllClicks().filter((c) => c.url_id === url_id);
}

// Get clicks for multiple URLs (pass array of url_ids)
export async function getClicksForUrls(url_ids = []) {
  return getAllClicks().filter((c) => url_ids.includes(c.url_id));
}

// Alias — same as getUrlClicks
export async function getClicksForUrl(url_id) {
  return getUrlClicks(url_id);
}

// Delete all clicks for a URL (used when deleting a URL)
export async function deleteClicksForUrl(url_id) {
  const clicks = getAllClicks().filter((c) => c.url_id !== url_id);
  setAllClicks(clicks);
  return true;
}