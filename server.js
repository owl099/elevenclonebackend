// // server.js
// require('dotenv').config();
// const express = require('express');
// const { MongoClient } = require('mongodb');

// const app = express();
// const port = 3001; // Choose a port that is not used by your Next.js app (which defaults to 3000)

// const MONGO_URL = process.env.MONGO_URL;
// const DB_NAME = "elevenlabs_project"; // Use the database name you created
// const COLLECTION_NAME = "audioFiles"; // Use the collection name you created

// let db;

// // Connect to MongoDB
// async function connectToDb() {
//   try {
//     const client = await MongoClient.connect(MONGO_URL);
//     console.log("Connected to MongoDB!");
//     db = client.db(DB_NAME);
//   } catch (error) {
//     console.error("Failed to connect to MongoDB:", error);
//     process.exit(1);
//   }
// }

// // API Endpoint
// app.get('/api/audio', async (req, res) => {
//   const lang = req.query.lang;
//   if (!lang) {
//     return res.status(400).json({ error: "Language parameter is required." });
//   }

//   try {
//     const audioCollection = db.collection(COLLECTION_NAME);
//     const audioFile = await audioCollection.findOne({ language: lang.toLowerCase() });

//     if (audioFile) {
//       res.status(200).json({ url: audioFile.url });
//     } else {
//       res.status(404).json({ error: "Audio file not found." });
//     }
//   } catch (error) {
//     console.error("Error fetching audio:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// // Start the server and connect to the database
// connectToDb().then(() => {
//   app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
//   });
// });











// server.js
// require('dotenv').config();
// const express = require('express');
// const { MongoClient } = require('mongodb');

// // --- Configuration ---
// const app = express();
// const port = process.env.PORT || 3001; // Use port 3001 or environment port
// const MONGO_URL = process.env.MONGO_URL;
// const DB_NAME = "audiofiles"; // Your database name
// const COLLECTION_NAME = "voices"; // Your collection name

// if (!MONGO_URL) {
//   console.error("MONGO_URL not found in .env file. Exiting.");
//   process.exit(1);
// }

// let client;
// let db;

// // --- Database Connection ---
// async function connectToDatabase() {
//   try {
//     client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
//     await client.connect();
//     console.log("Connected to MongoDB!");
//     db = client.db(DB_NAME);
//   } catch (error) {
//     console.error("Failed to connect to MongoDB:", error);
//     process.exit(1);
//   }
// }

// // --- API Endpoint ---
// app.get('/api/audio', async (req, res) => {
//   const lang = req.query.lang;
//   if (!lang) {
//     return res.status(400).json({ error: "Language parameter is required." });
//   }

//   try {
//     const audioCollection = db.collection(COLLECTION_NAME);
//     const audioFile = await audioCollection.findOne({ language: lang.toLowerCase() });

//     if (audioFile) {
//       res.status(200).json({ url: audioFile.url });
//     } else {
//       res.status(404).json({ error: "Audio file not found for this language." });
//     }
//   } catch (error) {
//     console.error("Error fetching audio:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// // --- Server Start and Graceful Shutdown ---
// async function startServer() {
//   await connectToDatabase();
//   const server = app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });

//   process.on('SIGINT', () => {
//     console.log('Shutting down gracefully...');
//     server.close(() => {
//       client.close();
//       console.log('Server and database connection closed.');
//       process.exit(0);
//     });
//   });
// }

// startServer();














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