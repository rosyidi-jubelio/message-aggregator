import { RmqClient } from "@jubelio/service-base";
import config from "@/config";

const {
  RMQ_USER,
  RMQ_PASSWORD,
  RMQ_HOST,
  RMQ_PORT,
  RMQ_VHOST,
  IMPORT_BATCH_ORDERS_QUEUE,
} = config;

const rmqChannel = new RmqClient();

export async function openRmqConnection() {
  if (rmqChannel.connection) {
    return rmqChannel;
  }

  await rmqChannel.openChannel({
    connectionString: `amqp://${RMQ_USER}:${RMQ_PASSWORD}@${RMQ_HOST}:${RMQ_PORT}/${RMQ_VHOST}`,
    queueName: IMPORT_BATCH_ORDERS_QUEUE,
    deadExchange: `${IMPORT_BATCH_ORDERS_QUEUE}-dead-exchange`,
    deadQueue: `${IMPORT_BATCH_ORDERS_QUEUE}-dead-letters`,
    deadQueueDurable: true,
    deadQueueTtl: 60000,
    queueDurable: false,
    queueExchange: `${IMPORT_BATCH_ORDERS_QUEUE}-exchange`,
    queueTtl: 180000,
  });

  if (!rmqChannel.connection) {
    throw new Error("Failed to connect to RMQ");
  }

  console.info("Connected to RMQ successfully");
  return rmqChannel;
}

export async function publishToRMQ(message: any) {
  if (!rmqChannel.connection) {
    await openRmqConnection();
  }
  await rmqChannel.sendMessage(message, { timeout: 5000 });
}
