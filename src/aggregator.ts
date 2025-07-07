import { OrderMessage } from "@/types/message.types";
import { Logger } from "@jubelio/service-base";
import config from "@/config";
import Promise from "bluebird";
import { mongoClient } from "@/mongo-client";

export const logger = Logger.createLogger(
  config.SERVICE_NAME,
  config.ES_LOG_ID,
  config.ES_API_KEY,
  config.ES_NODENAME,
  config.ES_USE_PASSWORD,
  config.ENABLE_LOG,
  config.ES_LOG_LEVEL
);

export const processMessages = async () => {
  const client = await mongoClient();
  const db = client.db(config.ORDER_MESSAGE_MONGO_DB_NAME);
  const orderMsgCollection = db.collection("order_messages");

  const messages: OrderMessage[] = await orderMsgCollection
    .aggregate([
      {
        $group: {
          _id: { store_id: "$store_id", channel_id: "$channel_id" },
          ref_nos: { $addToSet: "$ref_no" },
        },
      },
      {
        $project: {
          _id: 0,
          store_id: "$_id.store_id",
          channel_id: "$_id.channel_id",
          ref_nos: 1,
        },
      },
    ])
    .toArray();

  console.log(`got ${messages.length} stores of messages to process.`);

  await Promise.map(
    messages,
    async (message) => {
      const refNosChunks = chunkArray(
        message.ref_nos,
        config.MAX_REF_NOS_PER_MESSAGE
      );

      await Promise.map(
        refNosChunks,
        async (chunk) => {
          try {
            const aggregatedMessage = {
              store_id: message.store_id,
              channel_id: message.channel_id,
              ref_nos: chunk,
            };

            // await publishToRMQ(aggregatedMessage);
            await orderMsgCollection.deleteMany({
              store_id: message.store_id,
              channel_id: message.channel_id,
              ref_no: { $in: chunk },
            });
            logger.info(
              `Published message to RMQ, store_id: ${message.store_id}, channel_id: ${message.channel_id}, ref_nos count: ${chunk.length}`
            );
          } catch (error) {
            logger.error(
              `Failed to process message for store_id: ${message.store_id}, channel_id: ${message.channel_id}, error: ${error}`
            );
            return;
          }
        },
        { concurrency: 5 }
      );
    },
    { concurrency: 5 }
  );
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
