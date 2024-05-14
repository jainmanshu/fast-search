import { Redis } from "@upstash/redis";
import { countryList } from "./countryList";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

countryList.forEach((country) => {
  const term = country.toUpperCase();
  const terms: { score: 0; member: string }[] = [];

  for (let i = 0; i <= term.length; i++) {
    terms.push({ score: 0, member: term.substring(0, i) });
  }
  terms.push({ score: 0, member: term + "*" });

  const populateDb = async () => {
    // @ts-expect-error
    await redis.zadd("terms", ...terms);
  };

  populateDb();
});
