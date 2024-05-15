"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Image from "next/image";
import { useEffect, useState } from "react";

type SearchEngines = "postgres" | "redis";

export default function Home() {
  const [searchEngine, setSearchEngine] = useState<SearchEngines>("postgres");
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    results: string[];
    duration: number;
  }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!input) return setSearchResults(undefined);
      const res = await fetch(`/api/search?q=${input}`);
      const data = (await res.json()) as {
        results: string[];
        duration: number;
      };
      setSearchResults(data);
    };

    fetchData();
  }, [input]);

  return (
    <main className="h-screen w-screen grainy">
      <div className="flex flex-col gap-6 items-center pt-32 duration-500 animate-in animate fade-in-5 slide-in-from-bottom-2.5">
        <h1 className="text-5xl tracking-tight font-bold">SpeedSearch ⚡</h1>
        <p className="text-zinc-600 text-lg max-w-prose text-center">
          A high-performance API built with Hono, Next.js and Cloudflare. <br />{" "}
          Type a query below and get your results in miliseconds.
        </p>

        <div className="max-w-md w-full">
          <Command>
            <CommandInput
              value={input}
              onValueChange={setInput}
              placeholder="Search countries..."
              className="placeholder:text-zinc-500"
            />
            <CommandList>
              {searchResults?.results.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : null}

              {searchResults?.results ? (
                <CommandGroup heading="Results">
                  {searchResults?.results.map((result) => (
                    <CommandItem
                      key={result}
                      value={result}
                      onSelect={setInput}
                    >
                      {result}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}

              {searchResults?.results?.length ? (
                <>
                  <div className="h-px w-full bg-zinc-200" />

                  <p className="p-2 text-xs text-zinc-500">
                    Found {searchResults.results.length} results in{" "}
                    {searchResults?.duration.toFixed(0)}ms
                  </p>
                </>
              ) : null}
            </CommandList>
          </Command>
        </div>
        <div className="text-zinc-600 text-lg max-w-prose text-center">
          {" "}
          Select your search engine to see the typeahead performance.{" "}
        </div>
        <div className="flex items-center gap-12">
          <button className="flex flex-col items-center text-zinc-600">
            <div className="w-12 h-12 relative">
              <Image src="/postgres.svg" alt="Button 1" layout="fill" />
            </div>
            postgres
          </button>
          <button className="flex flex-col items-center text-zinc-600">
            <div className="w-12 h-12 relative">
              <Image src="/redis.svg" alt="redis" layout="fill" />
            </div>
            Redis
          </button>
          <button className="flex flex-col items-center text-zinc-600">
            <div className="w-12 h-12 relative">
              <Image src="/elastic.svg" alt="redis" layout="fill" />
            </div>
            Elasticsearch
          </button>
        </div>
      </div>
    </main>
  );
}
