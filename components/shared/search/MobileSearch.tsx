"use client";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import SearchResult from "./SearchResult";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery } from "@/lib/utils";

interface Props {
  view?: string;
}

const MobileSearch = ({ view = "desktop" }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        searchContainerRef.current &&
        // @ts-ignore
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearch("");
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [pathname, searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "search",
          value: search,
        });

        router.push(newUrl, { scroll: false });
      }
    }, 100);

    return () => clearTimeout(delayDebounceFn);
  }, [search, router, pathname, , searchParams]);
  return (
    <div
      className={`flex flex-col gap-1 ${
        view === "desktop"
          ? "bg-slate-100 dark:bg-slate-900 z-50 -mt-10 rounded-bl-md rounded-br-md"
          : ""
      }`}
    >
      {view === "mobile" ? (
        <div className="w-full  flex flex-col items-start gap-2">
          <Input
            autoFocus
            type="search"
            placeholder="Search for anything"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-input "
          />
        </div>
      ) : null}
      <SearchResult view={view} />
    </div>
  );
};

export default MobileSearch;
