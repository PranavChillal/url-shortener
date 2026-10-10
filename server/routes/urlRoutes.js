const express = require("express");
const Url = require("../models/Url");
const generateCode = require("../utils/generateCode");

const router = express.Router();

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getBaseUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
}

// POST /api/shorten
router.post("/shorten", async (req, res) => {
  const originalUrl = req.body?.originalUrl;

  if (
    !originalUrl ||
    typeof originalUrl !== "string" ||
    !isValidHttpUrl(originalUrl.trim())
  ) {
    return res
      .status(400)
      .json({ error: "Please provide a valid http or https URL." });
  }

  const baseUrl = getBaseUrl(req);

  // Try a few times in case a random code collides with an existing one
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const doc = await Url.create({
        originalUrl: originalUrl.trim(),
        shortCode: generateCode(),
      });

      return res.status(201).json({
        originalUrl: doc.originalUrl,
        shortCode: doc.shortCode,
        shortUrl: `${baseUrl}/${doc.shortCode}`,
      });
    } catch (err) {
      // 11000 = duplicate key (code already exists), so loop and try again
      if (err.code !== 11000) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong." });
      }
    }
  }

  res
    .status(500)
    .json({ error: "Could not generate a unique code, please try again." });
});

// GET /api/links  ->  list links, newest first, with click counts
router.get("/links", async (req, res) => {
  try {
    const docs = await Url.find().sort({ createdAt: -1 }).limit(100);
    const baseUrl = getBaseUrl(req);

    const links = docs.map((doc) => ({
      id: doc._id,
      originalUrl: doc.originalUrl,
      shortCode: doc.shortCode,
      shortUrl: `${baseUrl}/${doc.shortCode}`,
      clicks: doc.clicks,
      createdAt: doc.createdAt,
    }));

    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;