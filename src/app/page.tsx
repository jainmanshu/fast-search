"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    results: string[];
    duration: number;
  }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!input) setSearchResults(undefined);
      const res = await fetch(`/api/search?q=${input}`);
    };
    fetchData();
  }, [input]);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="text-zinc-900"
        type="text"
      />
    </div>
  );
}
