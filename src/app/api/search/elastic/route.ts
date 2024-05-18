import { type NextRequest, NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";

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
    const { body } = await client.search(
      {
        index: "countries",
        query: {
          match: {
            name: {
              query: q,
            },
          },
        },
        size: 5,
      },
      { meta: true }
    );

    // --------------------------
    const end = performance.now();
    // ---------------------------

    const results = body.hits.hits.map((hit: any) => hit._source.name);
    return NextResponse.json(
      {
        results,
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
