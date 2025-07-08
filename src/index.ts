import { logger, processMessages } from "@/aggregator";
import { Promise } from "bluebird";
import config from "@/config";

let isRunning = true;

process.on("SIGTERM", function onSigterm() {
  console.info("Got SIGTERM. Graceful shutdown start");
  isRunning = false;
});

process.on("SIGINT", function () {
  console.log("SIGINT");
  isRunning = false;
});

async function mainLoop() {
  while (isRunning) {
    const startTime = Date.now();
    try {
      await processMessages();
    } catch (error) {
      console.error(`Error processing messages: ${error}`);
    }
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    logger.info(`Processing took ${elapsedTime} ms`);
    // wait for the next interval
    await Promise.delay(config.PROCESSING_INTERVAL);
  }
}

async function main() {
  await mainLoop();
}

main()
  .then(() => {
    logger.log("Exit");
    process.exit(0);
  })
  .catch((err) => {
    logger.error(`Unhandled Error: ${err.stack}`);
    process.exit(1);
  });
