import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase, query } from "./db.js";
import authRoutes from "../backend/routes/auth.js";
import urlRoutes from "../backend/routes/urls.js";
import redirectRoutes from "../backend/routes/redirect.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Initialize database
await initializeDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.use("/api/analytics", redirectRoutes);

// Root-level redirect (catch-all for short URLs)
app.get("/:shortCode", async (req, res) => {
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

// Helper function to record click
async function recordClick(urlId) {
  try {
    const { v4: uuid } = await import("uuid");
    await query("INSERT INTO clicks (id, url_id) VALUES ($1, $2)", [
      uuid(),
      urlId,
    ]);

    await query("UPDATE urls SET clicks = clicks + 1 WHERE id = $1", [urlId]);
  } catch (error) {
    console.error("Error recording click:", error);
  }
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
