// import { MongoClient } from "mongodb";

// let cachedClient = null;
// let cachedDb = null;

// const DB_NAME = "audiofiles";
// const COLLECTION_NAME = "voices";

// async function connectToDatabase() {
//   if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

//   const client = new MongoClient(process.env.MONGO_URL);
//   await client.connect();
//   const db = client.db(DB_NAME);

//   cachedClient = client;
//   cachedDb = db;

//   return { client, db };
// }

// export default async function handler(req, res) {
//   const { lang } = req.query;

//   if (!lang) {
//     return res.status(400).json({ error: "Language parameter is required." });
//   }

//   try {
//     const { db } = await connectToDatabase();
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
// }


import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "audiofiles";

let cachedClient = null;
let cachedDb = null;

// Connect to MongoDB (caching for serverless)
async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;
  console.log("Connected to MongoDB! 🎉");
  return { client, db };
}

export default async function handler(req, res) {
  const lang = req.query.lang;

  if (!lang) {
    return res.status(400).json({ error: "Language parameter is required." });
  }

  try {
    const { db } = await connectToDatabase();
    const audioCollection = db.collection("voices");

    const audioFile = await audioCollection.findOne({ language: lang.toLowerCase() });

    if (audioFile) {
      res.status(200).json({ url: audioFile.url });
    } else {
      res.status(404).json({ error: "Audio file not found for this language." });
    }
  } catch (err) {
    console.error("MongoDB error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
