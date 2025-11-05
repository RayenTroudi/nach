"use client";
import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { TCourse } from "@/types/models.types";

import {
  pullKeywordFromCourse,
  pushKeywordsToCourse,
} from "@/lib/actions/course.action";

import { useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";
import { tags, TagType } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/shared";

const formSchema = z.object({
  keywords: z.array(z.string().min(3).max(15)).min(3).max(5),
});

type Props = {
  course: TCourse;
};

const KeywordsForm = ({ course }: Props) => {
  const [courseTags, setCourseTags] = useState<TagType[]>(() =>
    course?.keywords.length
      ? course?.keywords.map((keyword) => ({
          value: keyword.toLowerCase().trim(),
          label: keyword,
        }))
      : []
  );

  const keywordsUpdated =
    course.keywords.length !== courseTags.length ||
    course.keywords.some(
      (keyword) => !courseTags.find((tag) => tag.label === keyword)
    );

  const [searchedTag, setSearchedTag] = React.useState<TagType | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const router = useRouter();

  const onPickTagHandler = (tag: TagType) => {
    const alreadyExists = courseTags.find(
      (pickedTag) => pickedTag.value === tag.value.toLowerCase().trim()
    );

    if (courseTags.length === 5 && !alreadyExists) return;

    if (alreadyExists) {
      setCourseTags((prev) =>
        prev.filter(
          (pickedTag) => pickedTag.value !== tag.value.toLowerCase().trim()
        )
      );
    } else {
      setCourseTags((prev) => [...prev, tag]);
    }
  };

  const onSaveSelectedKeywords = async () => {
    try {
      setLoading(true);
      await pushKeywordsToCourse(
        courseTags.map((tag) => tag.label),
        course._id
      );

      scnToast({
        title: "Keywords Added",
        description:
          "Our System will use these keywords to make your course grow faster and recommended for students",
        variant: "success",
      });

      router.refresh();
    } catch (error: any) {
      setLoading(false);
      scnToast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const onPullKeywordHandler = async (keyword: string) => {
  //   setCourseKeywords(courseKeywords.filter((k) => k !== keyword));
  //   await pullKeywordFromCourse(course._id, keyword);

  //   scnToast({
  //     title: "Keyword Removed",
  //     description: "Keyword has been removed from your course",
  //     variant: "success",
  //   });

  //   router.refresh();
  // };

  return (
    <div className="w-full flex flex-col gap-y-2 p-4 bg-gradient-to-r from-purple-600  to-brand-red-500 dark:from-purple-600/80  dark:to-brand-red-500/80 rounded-md">
      <div className="w-full flex flex-col gap-y-2 ">
        <div className="w-full flex items-center justify-between">
          {" "}
          <div className="text-slate-50 text-xl md:text-2xl font-bold flex items-center gap-x-2">
            <p>Course Keywords</p>
            {keywordsUpdated ? (
              <Button
                className="p-0 h-fit px-4 py-1 rounded-full bg-gradient-to-r from-brand-red-600  to-purple-500 border-none outline-none text-slate-50 font-bold"
                variant={"outline"}
                onClick={onSaveSelectedKeywords}
              >
                {loading ? (
                  <Spinner className="text-slate-50" />
                ) : (
                  "Save Keywords"
                )}
              </Button>
            ) : (
              <p>({courseTags.length} / 5)</p>
            )}
          </div>
        </div>
        <div className="text-slate-300 font-semibold flex flex-col gap-y-2 mb-6">
          <p>
            Our System will use These keywords to help your course grow faster
            and recommended for students
          </p>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            asChild
            className={`
                flex items-center justify-center w-full 
                ${courseTags.length === 5 ? "pointer-events-none" : ""}
              `}
          >
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between  rounded-md  bg-slate-50 hover:bg-slate-50 border-none text-slate-950 hover:text-slate-950 pr-0"
            >
              {searchedTag
                ? tags.find((tag) => tag.value === searchedTag?.value)?.label
                : "javascript, typescript, php, frontend, fullstack..."}
              <Button
                variant={"ghost"}
                className="bg-gradient-to-r from-brand-red-600  to-purple-500 rounded-none rounded-r-md hover:from-purple-600  hover:to-brand-red-500 duration-1000 transition-all ease-in-out"
              >
                <Image
                  src="/icons/searchAI.svg"
                  width={30}
                  height={30}
                  alt="search icon"
                  className=""
                />
              </Button>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-full rounded-md "
            align="center"
            side="bottom"
          >
            <Command className="bg-slate-50 w-full rounded-md">
              <CommandInput
                placeholder="Search framework..."
                className="text-slate-950"
              />
              <CommandEmpty className="text-slate-950">
                No tag found.
              </CommandEmpty>
              <CommandGroup className="text-slate-950">
                {tags.map((tag, index) => (
                  <CommandItem
                    className={`rounded-full w-full flex items-center capitalize aria-selected:bg-accent dark:aria-selected:bg-slate-100 
                        ${
                          courseTags.find(
                            (courseTag) =>
                              courseTag.value === tag.value.toLowerCase().trim()
                          )
                            ? "bg-gradient-to-r from-purple-600  to-brand-red-500 text-slate-50 aria-selected:text-slate-50"
                            : "dark:aria-selected:text-slate-950"
                        }
                      `}
                    key={index}
                    value={tag.value}
                    onSelect={() => {
                      onPickTagHandler({
                        label: tag.label,
                        value: tag.value.toLowerCase().trim(),
                      });

                      if (courseTags.length + 1 === 5) {
                        setOpen(false);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        courseTags.find(
                          (courseTag) =>
                            courseTag.value === tag.value.toLowerCase().trim()
                        )
                          ? "opacity-100 text-slate-50"
                          : "opacity-0"
                      )}
                    />
                    {tag.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="w-full  mx-auto  text-xs flex items-center justify-center gap-x-4 flex-wrap max-h-[160px] overflow-y-auto">
          {tags.map((tag, index: number) => (
            // <>
            //   {/* {index < 30 ? (

            //   ) : null} */}
            // </>
            <div
              className={`
                        relative mt-5 cursor-pointer w-fit py-2 px-4 bg-slate-50 text-slate-950  capitalize font-bold rounded-full 
                              hover:text-brand-red-500  hover:from-purple-600  hover:to-red-500 transition-all ease-in-out
                              ${
                                courseTags.find(
                                  (courseTag) =>
                                    courseTag.value ===
                                    tag.value.toLowerCase().trim()
                                )
                                  ? "bg-gradient-to-r from-purple-600  to-brand-red-500 !text-slate-50"
                                  : ""
                              }
                      `}
              onClick={() => onPickTagHandler(tag)}
              key={index}
            >
              {courseTags.find(
                (courseTag) =>
                  courseTag.value === tag.value.toLowerCase().trim()
              ) ? (
                <span className="w-4 h-4 rounded-full absolute -right-1 -top-1 bg-gradient-to-r from-brand-red-600  to-purple-500"></span>
              ) : null}
              <p>{tag.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeywordsForm;
