import { type NextRequest, NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";

interface Document {
  name: string;
}

const queryValidator = /^[a-zA-Z() ]{1,50}$/;

export async function GET(request: NextRequest) {
  try {
    // --------------------------
    const start = performance.now();
    // ---------------------------
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.toUpperCase();

    if (!q || typeof q !== "string" || !queryValidator.test(q)) {
      return NextResponse.json(
        {
          results: [],
          message: "Invalid search query",
        },
        {
          status: 400,
        }
      );
    }
    const client = new Client({
      cloud: {
        id: process.env.ESS_CLOUD_ID || "",
      },
      auth: {
        apiKey: process.env.ESS_API_KEY || "",
      },
    });

    const result = await client.search<Document>({
      index: "countries",
      query: {
        match: {
          name: {
            query: q,
          },
        },
      },
      size: 5,
    });
    // --------------------------
    const end = performance.now();
    // ---------------------------

    return NextResponse.json(
      {
        results: result.hits.hits.map((hit) => hit?._source?.name),
        duration: end - start,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        results: [],
        duration: 0,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
