import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
import { countryList } from "./countryList";

// Load environment variables from .env file
dotenv.config();

const dataSet = countryList.map((country) => ({ name: country.toUpperCase() }));
// Replace the placeholders with your Elasticsearch configuration
const client = new Client({
  cloud: {
    id: process.env.ESS_CLOUD_ID || "",
  },
  auth: {
    apiKey: process.env.ESS_API_KEY || "",
  },
});

async function ingest_data(): Promise<void> {
  try {
    const result = await client.helpers.bulk({
      datasource: dataSet,
      pipeline: "ent-search-generic-ingestion",
      onDocument: (doc) => ({ index: { _index: "countries" } }),
    });
    console.log("Data ingested successfully", result);
  } catch (error) {
    console.error("Failed to ingest data:", error);
  }
}

ingest_data();
