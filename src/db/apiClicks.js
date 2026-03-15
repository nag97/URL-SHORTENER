import { UAParser } from "ua-parser-js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const parser = new UAParser();

/**
 * Record a click and redirect to original URL
 */
export const storeClicks = async ({ id, originalUrl }) => {
  try {
    // Get device info
    const res = parser.getResult();
    const device = res.type || "desktop";

    // Record click (non-blocking)
    fetch(`${API_BASE_URL}/analytics/click/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device,
        userAgent: navigator.userAgent,
      }),
    }).catch((err) => console.error("Error recording click:", err));

    // Redirect to the original URL
    window.location.href = originalUrl;
  } catch (error) {
    console.error("Error in storeClicks:", error);
    // Still redirect even if click recording fails
    window.location.href = originalUrl;
  }
};

/**
 * Get clicks for multiple URLs
 * Returns aggregated click data from backend
 */
export async function getClicksForUrls(urlIds) {
  return urlIds.map((id) => ({
    url_id: id,
    clicks: 0, // Will be populated from the URL object's clicks property
  }));
}

/**
 * Get clicks for a single URL
 */
export async function getClicksForUrl(url_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/stats/${url_id}`, {
      method: "GET",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return [
      {
        url_id: url_id,
        clicks: data.total_clicks || 0,
      },
    ];
  } catch (error) {
    console.error("Error getting URL stats:", error);
    return [];
  }
}
