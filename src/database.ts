import { Client } from "pg";
const client: Client = new Client({
  user: "Camila",
  password: "EASYCOMPANY1903",
  host: "localhost",
  database: "projects_and_developers",
  port: 5432,
});
const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("Database connected!");
};
export { client, startDatabase };
