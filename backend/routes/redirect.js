import express from "express";
import { query } from "../models/db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// Get long URL from short code and redirect
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL by short code or custom URL
    const result = await query(
      `SELECT id, original_url FROM urls 
       WHERE short_url = $1 OR custom_url = $1
       LIMIT 1`,
      [shortCode],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    const url = result.rows[0];

    // Record click asynchronously (don't wait)
    recordClick(url.id).catch((err) =>
      console.error("Click recording error:", err),
    );

    // Redirect with 301 permanent redirect
    res.redirect(301, url.original_url);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Record a click (async endpoint)
router.post("/click/:urlId", async (req, res) => {
  try {
    const { urlId } = req.params;
    const { device, userAgent } = req.body;

    // Record click
    await query(
      "INSERT INTO clicks (id, url_id, device, user_agent) VALUES ($1, $2, $3, $4)",
      [uuid(), urlId, device || "unknown", userAgent || ""],
    );

    // Update click count
    await query("UPDATE urls SET clicks = clicks + 1 WHERE id = $1", [urlId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Click recording error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get click stats for a URL
router.get("/stats/:urlId", async (req, res) => {
  try {
    const { urlId } = req.params;

    // Get total clicks
    const urlResult = await query("SELECT clicks FROM urls WHERE id = $1", [
      urlId,
    ]);

    if (urlResult.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Get clicks by device
    const deviceResult = await query(
      `SELECT device, COUNT(*) as count FROM clicks 
       WHERE url_id = $1 
       GROUP BY device`,
      [urlId],
    );

    res.json({
      total_clicks: urlResult.rows[0].clicks,
      by_device: deviceResult.rows,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to record click
async function recordClick(urlId) {
  try {
    await query("INSERT INTO clicks (id, url_id) VALUES ($1, $2)", [
      uuid(),
      urlId,
    ]);

    await query("UPDATE urls SET clicks = clicks + 1 WHERE id = $1", [urlId]);
  } catch (error) {
    console.error("Error recording click:", error);
  }
}

export default router;
