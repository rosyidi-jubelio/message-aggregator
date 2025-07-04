import "dotenv/config";

const config = {
  NODE_ENV: process.env.NODE_ENV,

  SERVICE_NAME: process.env.SERVICE_NAME || "order-message-aggregator",

  ORDER_MESSAGE_MONGO_URI:
    process.env.ORDER_MESSAGE_MONGO_URI ||
    "mongodb://admin:admin123@localhost:27017/",
  ORDER_MESSAGE_MONGO_DB_NAME:
    process.env.ORDER_MESSAGE_MONGO_DB_NAME || "order_message",

  RMQ_HOST: process.env.RMQ_HOST,
  RMQ_HOST_CLUSTER: process.env.RMQ_HOST_CLUSTER || process.env.RMQ_HOST,
  RMQ_CONNECTION_STRING: "",
  RMQ_PORT:
    process.env.RMQ_PORT === undefined
      ? 30001
      : parseInt(process.env.RMQ_PORT, 10),
  RMQ_USER: process.env.RMQ_USER,
  RMQ_PASSWORD: process.env.RMQ_PASSWORD || "",
  RMQ_VHOST: process.env.RMQ_VHOST || "",
  ENABLE_LOG:
    process.env.ENABLE_LOG === undefined
      ? false
      : JSON.parse(process.env.ENABLE_LOG),
  ES_LOG_ID: process.env.LOGGING_USERNAME || process.env.ES_LOG_ID,
  ES_API_KEY: process.env.LOGGING_PASSWORD || process.env.ES_API_KEY,
  ES_USE_PASSWORD:
    process.env.ES_USE_PASSWORD == "true"
      ? true
      : Boolean(process.env.ES_USE_PASSWORD) || false,
  ES_NODENAME: process.env.LOGGING_HOST,
  ES_LOG_LEVEL: process.env.ES_LOG_LEVEL || "info",
  ENABLE_APM:
    process.env.ENABLE_APM === undefined
      ? false
      : JSON.parse(process.env.ENABLE_APM),

  // Processing Configuration
  PROCESSING_INTERVAL: process.env.PROCESSING_INTERVAL || "*/3 * * * * *", // Every 3 seconds
  MAX_REF_NOS_PER_MESSAGE: parseInt(
    process.env.MAX_REF_NOS_PER_MESSAGE || "10"
  ),
};

let splitConnectionString: string[] = [];

if (config.RMQ_HOST_CLUSTER) {
  splitConnectionString = config.RMQ_HOST_CLUSTER.split(",") as string[];
}

const connectionStrings = splitConnectionString
  .map(
    (host: string) =>
      `amqp://${config.RMQ_USER}:${encodeURIComponent(
        config.RMQ_PASSWORD
      )}@${host}:${config.RMQ_PORT}/${config.RMQ_VHOST}`
  )
  .join(",");

config.RMQ_CONNECTION_STRING = connectionStrings;

export default config;
