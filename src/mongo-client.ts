const { MongoDBClient } = require("@jubelio/service-base");
import config from "@/config";

const client = new MongoDBClient();

export async function mongoClient() {
  if (client.connection) {
    return client;
  }

  await client.openConnection({
    connectionString: config.ORDER_MESSAGE_MONGO_URI,
  });
  if (!client.connection) {
    throw new Error("Failed to connect to MongoDB");
  }
  console.info("Connected to MongoDB successfully");
  return client;
}

export async function closeMongoClient() {
  if (client.connection) {
    await client.close();
  }
}
