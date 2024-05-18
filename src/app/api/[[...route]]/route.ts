import { Redis } from "@upstash/redis";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { handle } from "hono/vercel";
import { db } from "@vercel/postgres";

export const runtime = "edge";

const app = new Hono().basePath("/api/search");

const queryValidator = /^[a-zA-Z() ]{1,50}$/;

type EnvConfig = {
  UPSTASH_REDIS_REST_TOKEN: string;
  UPSTASH_REDIS_REST_URL: string;
};

app.get("/postgres", async (c) => {
  try {
    // --------------------------
    const start = performance.now();
    // ---------------------------
    const client = await db.connect();

    const query = c.req.query("q")?.toUpperCase();

    if (!query || !queryValidator.test(query)) {
      return c.json(
        { results: [], message: "Invalid search query" },
        { status: 400 }
      );
    }

    const { rows: res } = await client.sql`
    SELECT name
    FROM countries
    WHERE to_tsvector('simple', name) @@ websearch_to_tsquery('simple', ${query})
    OR name ILIKE ${query} || '%'
    ORDER BY 
    CASE 
    WHEN name ILIKE ${query} || '%' THEN 1
    ELSE 2
    END, 
    ts_rank_cd(to_tsvector('simple', name), websearch_to_tsquery('simple', ${query})) DESC
    LIMIT 5;
      `;

    // --------------------------
    const end = performance.now();
    // ---------------------------
    return c.json({
      results: res.map((res) => res.name),
      duration: end - start,
    });
  } catch (error) {
    console.error(error);
    return c.json(
      { results: [], duration: 0, message: "Something went wrong." },
      { status: 500 }
    );
  }
});

app.get("/redis", async (c) => {
  try {
    const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } =
      env<EnvConfig>(c);

    // --------------------------
    const start = performance.now();
    // ---------------------------

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });

    const query = c.req.query("q")?.toUpperCase();

    if (!query || !queryValidator.test(query)) {
      return c.json(
        { results: [], message: "Invalid search query" },
        { status: 400 }
      );
    }

    const res = [];
    const rank = await redis.zrank("terms", query);

    if (rank !== null && rank != undefined) {
      const temp = await redis.zrange<string[]>("terms", rank, rank + 100);

      for (const el of temp) {
        if (!el.startsWith(query)) {
          break;
        }
        if (el.endsWith("*")) {
          res.push(el.substring(0, el.length - 1));
        }
      }
    }

    // --------------------------
    const end = performance.now();
    // ---------------------------

    return c.json({
      results: res,
      duration: end - start,
    });
  } catch (error) {
    console.error(error);
    return c.json(
      { results: [], message: "Something went wrong." },
      { status: 500 }
    );
  }
});

export const GET = handle(app);
export default app as never;
