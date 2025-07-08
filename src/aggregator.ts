import { OrderMessage } from "@/types/message.types";
import { Logger } from "@jubelio/service-base";
import config from "@/config";
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
  const db = client.db(config.ORDER_QUEUE_MONGO_DB_NAME);
  const orderMsgCollection = db.collection(config.ORDER_QUEUE_COLLECTION_NAME);

  const result = await orderMsgCollection.findOneAndDelete({
    created_at: {
      $lt: new Date(Date.now() - config.MIN_MESSAGE_AGE_MS),
    },
  });

  if (!result.value) {
    logger.info("No messages to process");
    return;
  }

  const message: OrderMessage = result.value;
  try {
    // await publishToRMQ(aggregatedMessage);
    logger.info(
      `Published message to RMQ, store_id: ${message.store_id}, channel_id: ${message.channel_id}, ref_nos count: ${message.ref_nos.length}`
    );
  } catch (error) {
    logger.error(
      `Failed to process message for store_id: ${message.store_id}, channel_id: ${message.channel_id}, error: ${error}`
    );
    return;
  }
};
