import "reflect-metadata";
import { createBffApplication } from "./app.factory.js";
import { readBffConfig } from "./config.js";

const config = readBffConfig();
const app = await createBffApplication(config);

await app.listen({ host: "0.0.0.0", port: config.port });
