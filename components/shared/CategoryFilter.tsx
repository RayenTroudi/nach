"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ICategory } from "@/lib/models/category.model";
import { getAllCategories } from "@/lib/actions/category.action";
import Link from "next/link";
const CategoryFilter = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const { mode } = useTheme();

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCategories();

      localStorage.setItem("categoriesCache", JSON.stringify(response));

      setCategories(response || []);
    };

    fetchCategories();
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2 flex-shrink-0 w-fit h-[40px] mr-0 ml-4 lg:ml-0 md:mr-5">
          <Image
            src={
              mode === "dark"
                ? "/icons/category-dark.svg"
                : "/icons/category.svg"
            }
            alt="category"
            width={18}
            height={18}
            className="flex-shrink-0  w-[18px] h-[18px]"
          />
          <p className="hidden xl:block  text-[13px] lg:text-[16px] font-medium text-slate-950 dark:text-slate-200">
            Category
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div>
          {categories?.map((category) => (
            <DropdownMenuItem key={category._id}>
              <Link
                href={`/courses/${encodeURIComponent(category.name)}?category=${
                  category._id
                }`}
              >
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryFilter;
