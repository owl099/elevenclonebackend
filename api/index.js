// api/index.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Config ---
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "audiofiles";
const COLLECTION_NAME = "voices";

if (!MONGO_URL) {
  console.error("⚠️  MONGO_URL environment variable is NOT set.");
}

// --- DB caching ---
let client;
let db;
async function connectToDatabase() {
  if (db) {
    // cached
    return db;
  }
  if (!MONGO_URL) throw new Error("MONGO_URL not configured");
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("✅ Connected to MongoDB (cached).");
    return db;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    throw err;
  }
}

// --- Simple root / health ---
app.get('/', (req, res) => res.send('Welcome to the Audio API 🚀'));

// --- Get audio by language (accepts ?lang= or ?language=) ---
app.get('/api/audio', async (req, res) => {
  const raw = (req.query.lang || req.query.language || "").toString().trim();
  const queryLang = raw.toLowerCase();

  if (!queryLang) {
    return res.status(400).json({
      error: "Language parameter is required. Example: /api/audio?lang=english or ?language=english"
    });
  }

  try {
    const database = await connectToDatabase();
    const audioCollection = database.collection(COLLECTION_NAME);

    console.log("Searching for language:", queryLang);
    const audioFile = await audioCollection.findOne({ language: queryLang });

    console.log("DB result:", !!audioFile);
    if (audioFile) {
      return res.status(200).json({ url: audioFile.url });
    } else {
      return res.status(404).json({ error: "Audio file not found for this language." });
    }
  } catch (error) {
    console.error("Error fetching audio:", error && error.message ? error.message : error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// --- Optional: list available languages (frontend can call this to populate UI) ---
app.get('/api/languages', async (req, res) => {
  try {
    const database = await connectToDatabase();
    const audioCollection = database.collection(COLLECTION_NAME);
    const languages = await audioCollection.distinct('language');
    res.status(200).json({ languages });
  } catch (err) {
    console.error("Error listing languages:", err.message || err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Export app for Vercel. Also allow local running.
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running locally on http://localhost:${PORT}`);
    console.log("MONGO_URL configured?", !!MONGO_URL);
  });
}
