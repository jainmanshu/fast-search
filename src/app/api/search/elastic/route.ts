import { type NextRequest, NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";

interface Document {
  name: string;
}

export async function GET(request: NextRequest) {
  try {
    // --------------------------
    const start = performance.now();
    // ---------------------------
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q || typeof q !== "string") {
      return NextResponse.json(
        {
          message: "Invalid search query",
        },
        {
          status: 400,
        }
      );
    }
    const client = new Client({
      node: process.env.ELASTIC_URL || "",
      auth: {
        username: process.env.ELASTIC_USER || "",
        password: process.env.ELASTIC_PASSWORD || "",
      },
      tls: {
        ca: process.env.ELASTIC_CA,
        rejectUnauthorized: false,
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

    console.log(result.hits.hits);

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
