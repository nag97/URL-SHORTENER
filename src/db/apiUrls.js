const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("authToken");
}

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export async function getUrls(user_id) {
  const res = await fetch(`${API_BASE_URL}/urls`, {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch URLs");
  }

  return await res.json();
}

export async function getUrl({ id, user_id }) {
  const res = await fetch(`${API_BASE_URL}/urls/${id}`, {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error("URL not found");
  }

  return await res.json();
}

export async function getLongUrl(shortCode) {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/${shortCode}`, {
      method: "GET",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Get long URL error:", error);
    return null;
  }
}

export async function createUrl(
  { title, longUrl, customUrl, user_id },
  qrcode,
) {
  // Convert blob to base64 if needed
  let qrDataUrl = null;
  if (qrcode) {
    if (qrcode instanceof Blob) {
      qrDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(qrcode);
      });
    } else {
      qrDataUrl = qrcode;
    }
  }

  const res = await fetch(`${API_BASE_URL}/urls`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      title,
      longUrl,
      customUrl,
      qr: qrDataUrl,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create URL");
  }

  return await res.json();
}

export async function deleteUrl(id) {
  const res = await fetch(`${API_BASE_URL}/urls/${id}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete URL");
  }

  return { success: true };
}
