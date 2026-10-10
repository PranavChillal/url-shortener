require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const urlRoutes = require("./routes/urlRoutes");
const redirectRoutes = require("./routes/redirectRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", urlRoutes);

// Must stay LAST, because /:code matches almost any path
app.use("/", redirectRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});