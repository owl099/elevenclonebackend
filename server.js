

// server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

// --- Configuration ---
const app = express();
const port = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "audiofiles"; // Your database name
const COLLECTION_NAME = "voices"; // Your collection name

if (!MONGO_URL) {
  console.error("MONGO_URL not found in .env file. Exiting.");
  process.exit(1);
}

let client;
let db;

// --- Database Connection ---
// async function connectToDatabase() {
//   try {
//     client = new MongoClient(MONGO_URL);
//     await client.connect();
//     console.log("Connected to MongoDB!");
//     db = client.db(DB_NAME);
//   } catch (error) {
//     console.error("Failed to connect to MongoDB:", error);
//     process.exit(1);
//   }
// }


async function connectToDatabase() {
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    // Customize the message here
    console.log("Yokouso watashino database e"); 
    db = client.db(DB_NAME);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// --- API Endpoint ---
app.get("/", (req, res) => {
  res.send("Yokouso watashino database e 🚀");
});

app.get('/api/audio', async (req, res) => {
  const lang = req.query.lang;
  if (!lang) {
    return res.status(400).json({ error: "Language parameter is required." });
  }

  try {
    const audioCollection = db.collection(COLLECTION_NAME);
    const audioFile = await audioCollection.findOne({ language: lang.toLowerCase() });

    if (audioFile) {
      res.status(200).json({ url: audioFile.url });
    } else {
      res.status(404).json({ error: "Audio file not found for this language." });
    }
  } catch (error) {
    console.error("Error fetching audio:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Server Start and Graceful Shutdown ---
async function startServer() {
  await connectToDatabase();
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      client.close();
      console.log('Server and database connection closed.');
      process.exit(0);
    });
  });
}

startServer();