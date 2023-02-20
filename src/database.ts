import { Client } from "pg";
import "dotenv/config";

const client: Client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  database: process.env.DB,
});
const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("Database connected!");
};
export { client, startDatabase };
