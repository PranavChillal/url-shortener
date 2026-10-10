const express = require("express");
const Url = require("../models/Url");

const router = express.Router();

// GET /:code  ->  count the click and redirect to the original URL
router.get("/:code", async (req, res) => {
  try {
    // Find the link AND add 1 to clicks in a single database operation
    const doc = await Url.findOneAndUpdate(
      { shortCode: req.params.code },
      { $inc: { clicks: 1 } }
    );

    if (!doc) {
      return res.status(404).json({ error: "Short link not found." });
    }

    return res.redirect(302, doc.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;