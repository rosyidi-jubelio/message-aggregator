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
  return client;
}

export async function closeMongoClient() {
  if (client.connection) {
    await client.close();
  }
}
