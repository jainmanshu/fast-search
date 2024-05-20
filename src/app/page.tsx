"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type SearchEngines = "postgres" | "redis" | "elastic";

export default function Home() {
  const [searchEngine, setSearchEngine] = useState<SearchEngines>("postgres");
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    results: string[];
    duration: number;
  }>();
  const { toast } = useToast();

  const handleInput = useDebouncedCallback((value) => {
    setInput(value);
  }, 200);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!input) return setSearchResults(undefined);
        const res = await fetch(`/api/search/${searchEngine}?q=${input}`);
        if (!res.ok) {
          throw new Error("Failed to fetch data: " + res.status);
        }
        const data = (await res.json()) as {
          results: string[];
          duration: number;
        };
        setSearchResults(data);
      } catch (error) {
        console.log(error);
        toast({
          duration: 2000,
          variant: "destructive",
          title: "Invalid Query!!!",
          description: "There was a problem with your query. Please try again!",
        });
      }
    };

    fetchData();
  }, [input, searchEngine]);

  return (
    <main className="h-screen w-screen grainy">
      <div className="flex flex-col gap-4 items-center pt-32 duration-500 animate-in animate fade-in-5 slide-in-from-bottom-2.5">
        <h1 className="lg:text-5xl md:text-lg sm:text-xs tracking-tight font-semibold">
          ⚡ Lightning Fast Search ⚡
        </h1>
        <h4 className="text-zinc-700 lg:text-xl md:text-lg sm:text-base tracking-tight">
          High Performance Search Typeahead
        </h4>
        <p className="text-zinc-700 lg:text-lg md:text-base sm:text-sm max-w-prose text-center">
          Built with Hono, Next, Postgres, Redis and Elastic.
          <br />
          <span className="text-base">
            Search a country name and get your results in miliseconds.
          </span>
        </p>
        <div className="max-w-md w-full">
          <Command>
            <CommandInput
              onValueChange={handleInput}
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
                    <CommandItem key={result} value={result}>
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
        <div className="mt-4 text-zinc-700 lg:text-lg md:text-base sm:text-sm max-w-prose text-center">
          Select your search engine to see the typeahead performance.
        </div>
        <div className="m-8">
          <ToggleGroup
            type="single"
            size="lg"
            onValueChange={(value: SearchEngines) =>
              value && setSearchEngine(value)
            }
          >
            <ToggleGroupItem
              value="postgres"
              aria-label="Toggle postgres"
              className="flex flex-col h-15 w-15 hover:bg-stone-300 data-[state=on]:bg-stone-300"
            >
              <Image src="/postgres.svg" alt="redis" width={75} height={75} />
              <p className="text-zinc-700">Postgres</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="redis"
              aria-label="Toggle redis"
              className="flex flex-col h-15 w-15 hover:bg-stone-300 data-[state=on]:bg-stone-300"
            >
              <Image src="/redis.svg" alt="redis" width={75} height={75} />
              <p className="text-zinc-700">Redis</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="elastic"
              aria-label="Toggle elastic"
              className="flex flex-col h-15 w-15 hover:bg-stone-300 data-[state=on]:bg-stone-300"
            >
              <Image src="/elastic.svg" alt="elastic" width={75} height={75} />
              <p className="text-zinc-700">Elastic</p>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="m-4">
          <Link
            href="https://github.com/jainmanshu/fast-search"
            target="_blank"
            referrerPolicy="no-referrer"
            className={buttonVariants({
              variant: "ghost",
              size: "lg",
              className: "text-zinc-700 hover:bg-stone-300",
            })}
          >
            Star on GitHub ⭐
          </Link>
        </div>
      </div>
    </main>
  );
}
