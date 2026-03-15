import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../models/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, profile_pic } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      "INSERT INTO users (email, password_hash, name, profile_pic) VALUES ($1, $2, $3, $4) RETURNING id, email, name, profile_pic",
      [email, password_hash, name, profile_pic],
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          profile_pic: user.profile_pic,
        },
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const result = await query(
      "SELECT id, email, password_hash, name, profile_pic FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          profile_pic: user.profile_pic,
        },
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, email, name, profile_pic FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      user_metadata: {
        name: user.name,
        profile_pic: user.profile_pic,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side token removal is sufficient, but endpoint for consistency)
router.post("/logout", (req, res) => {
  res.json({ success: true });
});

export default router;
