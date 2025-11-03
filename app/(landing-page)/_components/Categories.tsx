"use client";
import { Category } from "@/components/shared";
import { TCategory } from "@/types/models.types";
import Link from "next/link";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  categories: TCategory[];
}

const Categories = ({ categories }: Props) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    breakpoints: {
      "(max-width: 767px)": {
        slides: {
          perView: 1,
        },
      },
      "(min-width: 768px)": {
        slides: {
          perView: 3,
        },
      },
      "(min-width: 1024px)": {
        slides: {
          perView: 4,
        },
      },
    },
  });

  return (
    <>
      {categories.length ? (
        <div className="w-full flex flex-col gap-y-4">
          <div
            ref={sliderRef}
            className="w-full keen-slider grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {categories.map((category: TCategory, key: number) => {
              const publishedCourseCount = category.courses.filter(
                (course) => course.isPublished
              ).length;

              return (
                <Link
                  key={key}
                  href={`/courses/${encodeURIComponent(
                    category.name
                  )}?category=${category._id}`}
                  className="w-full md:w-[160px] keen-slider__slide"
                >
                  <Category
                    category={category.name}
                    courses={publishedCourseCount}
                  />
                </Link>
              );
            })}
          </div>

          {loaded && instanceRef.current && (
            <div className="w-full md:[80%] mx-auto flex justify-center md:justify-between items-center">
              <div className="flex gap-x-2 items-center justify-center md:justify-between w-full">
                <Button
                  className="hidden md:flex items-center justify-center rounded-md bg-[#ff782d] opacity-90 hover:opacity-100 hover:bg-[#ff782d] text-slate-50"
                  onClick={(e: any) =>
                    e.stopPropagation() || instanceRef.current?.prev()
                  }
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft size={35} className="flex-shrink-0  " />
                </Button>

                <div className="flex items-center gap-x-2">
                  {Array.from(
                    Array(
                      instanceRef.current.track.details.slides.length
                    ).keys()
                  ).map((idx) => {
                    return (
                      <Button
                        key={idx}
                        onClick={() => {
                          instanceRef.current?.moveToIdx(idx);
                        }}
                        className={`border border-input bg-transparent size-3 p-0 rounded-full ${
                          currentSlide === idx
                            ? "bg-[#ff782d] text-slate-50"
                            : ""
                        }`}
                      ></Button>
                    );
                  })}
                </div>

                <Button
                  className="hidden md:flex items-center justify-center  rounded-md bg-[#ff782d] opacity-90 hover:opacity-100 hover:bg-[#ff782d] text-slate-50"
                  onClick={(e: any) =>
                    e.stopPropagation() || instanceRef.current?.next()
                  }
                  disabled={
                    currentSlide ===
                    instanceRef.current.track.details.slides.length - 1
                  }
                >
                  <ChevronRight
                    size={35}
                    className="flex-shrink-0  cursor-pointer"
                  />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-slate-950 dark:text-slate-200">
          No categories found
        </p>
      )}
    </>
  );
};

export default Categories;
