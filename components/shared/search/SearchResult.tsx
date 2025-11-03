import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchFilters from "./SearchFilters";
import { globalSearch } from "@/lib/actions/general.action";
import Spinner from "../Spinner";

export const SearchResult = ({ view = "desktop" }: { view?: string }) => {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState([]);
  const search = searchParams.get("search");
  const type = searchParams.get("type");

  useEffect(() => {
    const fetchResult = async () => {
      setResult([]);
      setIsLoading(true);
      try {
        const res = await globalSearch({
          query: search,
          type,
        });
        setResult(JSON.parse(res));
      } catch (error) {
        console.log(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    if (search) {
      fetchResult();
    }
  }, [search, type]);

  return (
    <div className="flex flex-col items-start p-4 gap-1 bg-slate-100 dark:bg-slate-900 z-50  rounded-bl-md rounded-br-md">
      <SearchFilters view={view} />

      <div className="flex flex-col gap-2 w-full">
        <p className=" font-semibold text-slate-700 dark:text-slate-300">
          Top Match
        </p>
        {isLoading ? (
          <div className="flex justify-center items-center flex-col px-5">
            <Spinner size={25} />
            <p className="text-center text-slate-700 bg:text-slate-300">
              Browsing the entire database
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {result.length > 0 ? (
              result.map((item: any, index: number) => (
                <Link
                  href={{
                    pathname:
                      item.type === "instructor"
                        ? `/user/${item.id}`
                        : item.type === "course"
                        ? `/course/${item.id}`
                        : `/courses/${item.id}`,
                    query: { data: JSON.stringify(item) },
                  }}
                  key={`${item.type}-${item.id}-${index}`}
                  className="p-2 rounded-sm flex gap-2 w-full hover:bg-slate-200 dark:hover:bg-slate-950 transition duration-300 ease-in-out items-center cursor-pointer"
                >
                  {item.picture ||
                  (!item.picture && item.type !== "category") ? (
                    <Image
                      src={
                        item.picture ||
                        (item.type === "course"
                          ? "/images/default-course-thumbnail.jpg"
                          : "/icons/tag.svg")
                      }
                      alt="tags"
                      width={80}
                      height={10}
                      className={` object-contain ${
                        item.type === "instructor"
                          ? "rounded-full w-[40px]"
                          : item.type === "course"
                          ? "rounded-sm h-full"
                          : ""
                      }`}
                    />
                  ) : null}
                  <div className="flex flex-col w-full ">
                    <p className="text-slate-700 dark:text-slate-300 small-medium  font-bold capitalize">
                      {item.title}
                    </p>
                    <p className="body-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.type}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex-center flex-col ">
                <p className="text-center text-slate-500">
                  Opps, no results found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchResult;
