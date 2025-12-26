"use client";
import { useState, useEffect, useCallback } from "react";
import { Container, Course, Spinner } from "@/components/shared";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCoursesByCategoryID, getCoursesByTitle } from "@/lib/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslations } from 'next-intl';

import NoCoursesAnimation from "@/components/shared/animations/NoCourses";
import { TCourse } from "@/types/models.types";
import { useQuery } from "@tanstack/react-query";
import { getCoursesByFilter } from "@/lib/actions/course.action";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CourseState,
  Rating,
  languageOptions,
  levelOptions,
} from "./_components/course-validator";
import debounce from "lodash.debounce";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

interface props {
  params: {
    keywords: string;
  };
}

const Page = ({ params }: props) => {
  const t = useTranslations('coursesPage');
  const [showSpinner, setShowSpinner] = useState(true);
  const [courses, setCourses] = useState<TCourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const DEFAULT_CUSTOM_PRICE = [0, 999] as [number, number];

  const searchParams = useSearchParams();

  const categoryQuery = searchParams.get("category");

  const [filter, setFilter] = useState<CourseState>({
    language: [],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
    level: [],
    rating: [],

    category: [],
  });

  const PRICE_FILTERS = {
    id: "price",
    name: "Price",
    options: [
      { value: [0, 999], label: t('filters.price.any') },
      {
        value: [0, 20],
        label: t('filters.price.under20'),
      },
      {
        value: [0, 40],
        label: t('filters.price.under40'),
      },
    ],
  } as const;

  const { refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      if (
        filter.language.length != 0 ||
        filter.level.length != 0 ||
        filter.rating.length != 0 ||
        filter.price.range[0] != 0 ||
        filter.price.range[1] != 999 ||
        filter.category.length != 0
      ) {
        const data = await getCoursesByFilter(filter);
        setCourses(data);
        return data;
      } else {
        return null;
      }
    },
  });
  const onSubmit = () => refetch();

  const debouncedSubmit = debounce(onSubmit, 400);
  const _debouncedSubmit = useCallback(debouncedSubmit, [debouncedSubmit]);
  const applyArrayFilter = ({
    type,
    value,
  }: {
    type: keyof Omit<typeof filter, "price">;
    value: string;
  }) => {
    const isFilterApplied = filter[type].includes(value as never);

    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [type]: (prev[type] as string[]).filter((v) => v !== value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [type]: [...prev[type], value],
      }));
    }

    _debouncedSubmit();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = JSON.parse(
          localStorage.getItem("categoriesCache") || "[]"
        );
        let initalCourses = [];
        if (categoryQuery) {
          initalCourses = await getCoursesByCategoryID(categoryQuery);
        } else {
          initalCourses = await getCoursesByTitle(params.keywords);
        }

        setCourses(initalCourses);
        const categoryNames = [
          ...categoriesData.map((category: { name: any }) => category.name),
        ];
        setCategories(categoryNames);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, [categoryQuery, params.keywords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  if (showSpinner) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={100} />
      </div>
    );
  }

  const renderFilterSection = (options: any[], filterKey: string) => (
    <Accordion type="multiple" className="animate-none ">
      <AccordionItem
        value={filterKey}
        className="text-slate-800 dark:text-slate-300"
      >
        <AccordionTrigger>
          <span className="font-medium">{filterKey}</span>
        </AccordionTrigger>

        <AccordionContent className="pt-6 animate-none text-slate-800 dark:text-slate-300">
          <ul className="space-y-4">
            {options.map((option, optionIdx) => (
              <li key={option + optionIdx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`${filterKey}-${optionIdx}`}
                  onChange={() => {
                    applyArrayFilter({
                      type: filterKey.toLowerCase() as keyof Omit<
                        typeof filter,
                        "price"
                      >,
                      value: option,
                    });
                  }}
                  checked={filter[
                    filterKey as keyof Omit<typeof filter, "price">
                  ]?.includes(option as never)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={`${filterKey}-${optionIdx}`}>
                  {option}
                  {filterKey.toLowerCase() === "rating" && "⭐".repeat(option)}
                </label>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

  const renderFilterComponent = () => (
    <div className="flex flex-col gap-y-4 w-full">
      {renderFilterSection(categories, "Category")}
      {renderFilterSection(Array.from(languageOptions), "Language")}
      <Accordion type="multiple" className="animate-none">
        <AccordionItem
          value="price"
          className="text-slate-800 dark:text-slate-300"
        >
          <AccordionTrigger>
            <span className="font-medium  text-slate-800 dark:text-slate-300">
              Price
            </span>
          </AccordionTrigger>

          <AccordionContent className=" animate-none text-slate-800 dark:text-slate-300">
            <ul className="space-y-4">
              {PRICE_FILTERS.options.map((option, optionIdx) => (
                <li key={option.label} className="flex items-center">
                  <input
                    type="radio"
                    id={`price-${optionIdx}`}
                    onChange={() => {
                      setFilter((prev) => ({
                        ...prev,
                        price: {
                          isCustom: false,
                          range: [...option.value],
                        },
                      }));

                      _debouncedSubmit();
                    }}
                    checked={
                      !filter.price.isCustom &&
                      filter.price.range[0] === option.value[0] &&
                      filter.price.range[1] === option.value[1]
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`price-${optionIdx}`}
                    className="ml-3 text-sm text-gray-600"
                  >
                    {option.label}
                  </label>
                </li>
              ))}
              <li className="flex justify-center flex-col gap-2">
                <div>
                  <input
                    type="radio"
                    id={`price-${PRICE_FILTERS.options.length}`}
                    onChange={() => {
                      setFilter((prev) => ({
                        ...prev,
                        price: {
                          isCustom: true,
                          range: [0, 999],
                        },
                      }));

                      _debouncedSubmit();
                    }}
                    checked={filter.price.isCustom}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`price-${PRICE_FILTERS.options.length}`}
                    className="ml-3 text-sm text-gray-600"
                  >
                    Custom
                  </label>
                </div>

                <div className="flex justify-between">
                  <p className="font-medium">Price</p>
                  <div>
                    {filter.price.isCustom
                      ? minPrice.toFixed(0)
                      : filter.price.range[0].toFixed(0)}{" "}
                    € -{" "}
                    {filter.price.isCustom
                      ? maxPrice.toFixed(0)
                      : filter.price.range[1].toFixed(0)}{" "}
                    €
                  </div>
                </div>

                <Slider
                  className={cn({
                    "opacity-50": !filter.price.isCustom,
                  })}
                  disabled={!filter.price.isCustom}
                  onValueChange={(range) => {
                    const [newMin, newMax] = range;

                    setFilter((prev) => ({
                      ...prev,
                      price: {
                        isCustom: true,
                        range: [newMin, newMax],
                      },
                    }));

                    _debouncedSubmit();
                  }}
                  value={
                    filter.price.isCustom
                      ? filter.price.range
                      : DEFAULT_CUSTOM_PRICE
                  }
                  min={DEFAULT_CUSTOM_PRICE[0]}
                  defaultValue={DEFAULT_CUSTOM_PRICE}
                  max={DEFAULT_CUSTOM_PRICE[1]}
                  step={5}
                />
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {renderFilterSection(Array.from(levelOptions), "Level")}
      {renderFilterSection(Array.from(Rating), "Rating")}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "calc(100vh-330px)",
      }}
    >
      <Container className="flex flex-col gap-y-16 ">
        <div className="flex flex-col gap-y-2 ">
          <h1 className="text-slate-950 dark:text-slate-200 text-3xl md:text-4xl font-bold">
            All Courses
          </h1>
          <p className="pl-2 text-md lg:text-lg text-slate-500 font-semibold">
            <span className="text-brand-red-500">{courses.length} Courses</span>{" "}
            match your desire
          </p>
        </div>

        <Sheet>
          <SheetTrigger asChild className="">
            <Button className="w-[100px] flex items-center gap-x-2 lg:hidden mt-4  border border-input rounded text-slate-950  bg-transparent hover:bg-transparent">
              <ListFilter
                size={18}
                className="text-slate-800 dark:text-slate-200"
              />
              <span className="text-slate-800 dark:text-slate-200">Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            {renderFilterComponent()}
          </SheetContent>
        </Sheet>

        <div className="w-full  flex gap-2">
          <div className="w-96 hidden lg:flex lg:items-start lg:justify-start border-r  border-input px-4">
            {renderFilterComponent()}
          </div>
          {courses.length ? (
            <div className="w-full flex justify-evenly flex-wrap gap-2">
              {courses.map((course: TCourse, key: number) => (
                <Link
                  href={`/course/${course._id}`}
                  key={key}
                  className=" w-full md:w-[360px] "
                >
                  <Course
                    course={course}
                    withFramerMotionAnimation={false}
                    className="w-full"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="w-full  flex flex-col items-center justify-start gap-y-1">
              <NoCoursesAnimation className="h-[300px] lg:h-[500px] " />
              <p className="text-lg md:text-xl font-semibold">
                No Courses Found .
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Page;
