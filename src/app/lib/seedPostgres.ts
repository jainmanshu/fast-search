import { db } from "@vercel/postgres";
import { countryList } from "./countryList";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function seedDatabase() {
  const client = await db.connect();

  try {
    await client.sql`
        CREATE TABLE IF NOT EXISTS countries (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
    );`;

    console.log(`Created "countries" table`);

    // Batch insert countries
    const values = countryList.map((country) => [country]);
    const queryText = `INSERT INTO countries (name) VALUES ${values
      .map((_, index) => `($${index + 1})`)
      .join(",")}`;
    await client.query(queryText, values.flat());

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await db.end();
  }
}

seedDatabase();
