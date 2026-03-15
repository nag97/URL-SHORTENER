import express from "express";
import { query } from "../models/db.js";
import { verifyToken } from "../middleware/auth.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// Generate random short code
function generateShortCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create new short URL
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, longUrl, customUrl, qr } = req.body;
    const userId = req.user.id;

    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }

    // Check if custom URL is taken
    if (customUrl) {
      const existing = await query(
        "SELECT id FROM urls WHERE custom_url = $1",
        [customUrl],
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Custom URL already taken" });
      }
    }

    // Generate unique short code
    let shortUrl;
    let isUnique = false;
    while (!isUnique) {
      shortUrl = generateShortCode();
      const existing = await query("SELECT id FROM urls WHERE short_url = $1", [
        shortUrl,
      ]);
      if (existing.rows.length === 0) {
        isUnique = true;
      }
    }

    // Extract title from URL if not provided
    const urlTitle = title || new URL(longUrl).hostname;

    // Create URL record
    const result = await query(
      `INSERT INTO urls (id, user_id, title, original_url, short_url, custom_url, qr)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, title, original_url, short_url, custom_url, qr, clicks, created_at`,
      [uuid(), userId, urlTitle, longUrl, shortUrl, customUrl || null, qr],
    );

    const newUrl = result.rows[0];
    res.status(201).json(newUrl);
  } catch (error) {
    console.error("Create URL error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all URLs for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      "SELECT id, title, original_url, short_url, custom_url, qr, clicks, created_at FROM urls WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get URLs error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get single URL
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      "SELECT id, title, original_url, short_url, custom_url, qr, clicks, created_at FROM urls WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get URL error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete URL
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      "DELETE FROM urls WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete URL error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
