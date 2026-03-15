const URLS_KEY = "urls";

function getUrls() {
  return JSON.parse(localStorage.getItem(URLS_KEY)) || [];
}

function setUrls(urls) {
  localStorage.setItem(URLS_KEY, JSON.stringify(urls));
}

function generateShortCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createShortUrl(data, qr) {
  const urls = getUrls();
  let shortCode;
  do {
    shortCode =
      data.customUrl && data.customUrl.trim() !== ""
        ? data.customUrl
        : generateShortCode();
  } while (urls.find((u) => u.shortCode === shortCode));

  let qrData = undefined;
  if (qr) {
    qrData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(qr);
    });
  }

  const url = {
    id: Date.now().toString(),
    userId: data.user_id,
    title: data.title || "",
    originalUrl: data.longUrl,
    shortCode,
    createdAt: new Date().toISOString(),
    clicks: 0,
    qr: qrData,
  };

  urls.push(url);
  setUrls(urls);
  return [url];
}

function getUserUrls(userId) {
  return getUrls().filter((u) => u.userId === userId);
}

function deleteUrl(shortCode) {
  const remaining = getUrls().filter((u) => u.shortCode !== shortCode);
  setUrls(remaining);
}

function resolveShortUrl(shortCode) {
  const urls = getUrls();
  const url = urls.find((u) => u.shortCode === shortCode);
  if (url) {
    url.clicks += 1;
    setUrls(urls);
    return url;
  }
  return null;
}

export {
  createShortUrl,
  getUserUrls,
  deleteUrl,
  resolveShortUrl,
  generateShortCode,
};