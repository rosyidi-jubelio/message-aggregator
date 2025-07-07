import { processMessages } from "@/aggregator";

const main = async () => {
  console.info("Starting message aggregator service…");
  await processMessages();
  console.info("Finished processing.");
  process.exit(0);
};

main().catch((err) => {
  console.error(`Fatal error: ${err}, ${err.stack}`);
  process.exit(1);
});
