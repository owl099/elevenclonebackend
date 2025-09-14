// api/index.js

// Load environment variables from a .env file
//  api/index.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors'); // <--- Add this line

// --- Configuration ---
const app = express();
app.use(cors()); // <--- Add this line to use CORS middleware


// Retrieve environment variables
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "audiofiles";
const COLLECTION_NAME = "voices";

// Check if the MongoDB URL is configured
if (!MONGO_URL) {
  console.error("MONGO_URL environment variable is not set. Please add it to your Vercel project's environment variables.");
}

// Global variables to cache the database connection across multiple requests
let client;
let db;

// --- Database Connection Function with Caching ---
// This function connects to MongoDB. It returns a cached connection if one already exists.
async function connectToDatabase() {
  // If a connection is already established, return the existing database object
  if (db) {
    console.log("Using cached database connection.");
    return db;
  }

  // If no connection exists, create a new one
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    // Store the database object for future use
    db = client.db(DB_NAME);
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
 
    throw error;
  }
}

// --- API Endpoints ---  adding comment to push

// Root endpoint: a simple GET request to check if the API is running
app.get("/", (req, res) => {
  res.send("Welcome to the Audio API 🚀");
});

// Audio endpoint: fetches audio file URL based on a language query parameter
app.get('/api/audio', async (req, res) => {
  const lang = req.query.lang;

  // Validate the request: ensure the 'lang' parameter is provided
  if (!lang) {
    return res.status(400).json({ error: "Language parameter is required. Example: /api/audio?lang=english" });
  }

  try {
    // Get the database instance using the cached connection
    const database = await connectToDatabase();
    const audioCollection = database.collection(COLLECTION_NAME);

    // Find a document where the language matches the query
    const audioFile = await audioCollection.findOne({ language: lang.toLowerCase() });

    // Handle different response scenarios
    if (audioFile) {
      // If a file is found, send a successful response with the URL
      res.status(200).json({ url: audioFile.url });
    } else {
      // If no file is found for the given language, send a 404 Not Found response
      res.status(404).json({ error: "Audio file not found for this language." });
    }
  } catch (error) {
    // Catch any connection or database query errors
    console.error("Error fetching audio:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Export the Express App ---
// This is required for Vercel to recognize your application as a serverless function
module.exports = app;