"use client";

import { formUrlQuery } from "@/lib/utils";
import { Button } from "../ui/button";
import { useSearchParams, useRouter } from "next/navigation";

interface Props {
  pageNumber: number;
  isNext: boolean;
}

const Pagination = ({ pageNumber, isNext }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (direction: string) => {
    const nextPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;

    const newUrl = formUrlQuery({
      params: searchParams.keys.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    router.push(newUrl);
  };

  if (!isNext && pageNumber === 1) {
    return null;
  }

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Button
        disabled={pageNumber === 1}
        onClick={() => handleNavigation("prev")}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          pageNumber === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        } border border-gray-300`}
      >
        Prev
      </Button>

      <div className="flex items-center justify-center rounded-md bg-orange-500 px-4 py-2">
        <p className="text-sm font-semibold text-white">{pageNumber}</p>
      </div>

      <Button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          !isNext
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        } border border-gray-300`}
      >
        Next
      </Button>
    </div>
  );
};
export default Pagination;
