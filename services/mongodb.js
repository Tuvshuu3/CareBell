const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.MONGODB_DB || "carebell";

if (!uri) {
  throw new Error("Missing uri in dotenv");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  await client.connect();
  db = client.db(dbName);
  return db;
}

function getPatientsCollection() {
  if (!db) {
    throw new Error("Db not connected");
  }

  return db.collection("patients");
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

async function closeDatabaseConnection() {
  await client.close();
  db = null;
}

module.exports = {
  closeDatabaseConnection,
  connectToDatabase,
  getPatientsCollection,
  toObjectId,
};
