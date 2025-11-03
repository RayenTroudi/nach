"use client";
import { SearchFiltersTypes } from "@/constants/constants";
import React from "react";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const SearchFilters = ({ view = "desktop" }: { view?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeParams = searchParams.get("type");

  const [active, setActive] = useState(typeParams || "");

  const handleTypeClick = (item: string) => {
    if (active === item) {
      setActive("");

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: null,
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(item);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: item.toLowerCase(),
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className={`flex items-center w-full gap-4`}>
      <div
        className={`w-full flex items-center mb-4 ${
          view === "desktop" ? "gap-2" : "justify-between"
        } `}
      >
        {view === "desktop" ? (
          <p className="font-bold text-slate-800 dark:text-slate-200 text-xl">
            Filter By :{" "}
          </p>
        ) : null}
        {SearchFiltersTypes.map((item) => (
          <Button
            type="button"
            key={item.value}
            className={` text-slate-700 dark:text-slate-200  hover:bg-[#FF7000] hover:text-white small-medium :text-[#F4F6F8] rounded-sm w-16 h-[32px] px-10 capitalize 
            ${
              active === item.value
                ? "bg-[#FF7000] text-slate-200 "
                : "bg-slate-200 dark:bg-slate-950"
            }
            `}
            onClick={() => handleTypeClick(item.value)}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilters;
