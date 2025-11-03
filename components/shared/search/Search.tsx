"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "../../ui/input";
import Image from "next/image";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import MobileSearch from "./MobileSearch";
import { Button } from "@/components/ui/button";

const Search = ({
  placeholder = "Search for anything ...",
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const searchContainerRef = useRef(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearch = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        const newUrl = `/courses/${encodeURIComponent(search.trim())}`;
        router.push(newUrl);
        setIsTyping(false);
      } else if (e.key === "Escape") {
        setIsTyping(false);
      }
    },
    [router, search]
  );

  const onTypingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      // @ts-ignore
      if (!searchContainerRef.current?.contains(event.target)) {
        setIsTyping(false);
        setSearch("");
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [router, search, searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "search",
          value: search,
        });
        router.push(newUrl, { scroll: false });
      } else {
        const newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["search", "type"],
        });

        router.push(newUrl, { scroll: true });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  return (
    <div
      className={`flex-1 w-full h-[45px] bg-transparent relative ${
        className ? className : " lg:block  "
      }`}
      ref={searchContainerRef}
    >
      <Input
        placeholder={placeholder}
        className={`hidden md:block w-full  pl-[55px] h-full text-slate-950 dark:text-slate-200 font-semibold bg-slate-100 dark:bg-slate-900 border-none outline-none ${
          isTyping ? "rounded-none rounded-tl-md rounded-tr-md" : "rounded-md"
        } focus-visible:ring-0 focus-visible:ring-offset-0`}
        value={search}
        onFocus={() => setIsTyping(true)}
        onChange={onTypingHandler}
        onKeyDown={handleSearch}
      />

      <Button
        name="search"
        className="hidden md:block bg-transparent hover:bg-transparent"
      >
        <Image
          src="/icons/search.svg"
          alt="search"
          width={25}
          height={25}
          className="left-3/4 absolute top-1/2 transform -translate-y-1/2 md:left-4"
        />
      </Button>

      {isTyping ? <MobileSearch /> : null}
    </div>
  );
};

export default Search;
