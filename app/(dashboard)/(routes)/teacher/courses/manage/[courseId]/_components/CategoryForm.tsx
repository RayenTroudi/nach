"use client";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Loader2, PencilLineIcon, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { Combobox, ShowMoreLess, Spinner } from "@/components/shared";
import {
  addCourseToCategory,
  getAllCategories,
  removeCourseFromCategory,
} from "@/lib/actions/category.action";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { IUser } from "@/lib/models/user.model";
import { ICategory } from "@/lib/models/category.model";
import { scnToast } from "@/components/ui/use-toast";
import { TCategory, TCourse } from "@/types/models.types";

const formSchema = z.object({
  category: z.string(),
});

interface Props {
  course: TCourse;
}

const CategoryForm = ({ course }: Props) => {
  const pathname = usePathname();
  const [edit, setEdit] = useState<boolean>(false);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: course?.category?._id ? course.category._id : "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const options = categories?.map((category) => {
    return { label: category?.name, value: category?._id };
  });

  const selectedCategory = options?.find(
    (option) => option.value === course.category._id
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.category)
      return scnToast({
        variant: "destructive",
        title: "Error",
        description: "Please select a category",
      });

    try {
      if (values.category === selectedCategory?.value)
        return scnToast({
          variant: "default",
          title: "Info",
          description:
            "No changes made, your course is already in this category",
        });

      await removeCourseFromCategory({
        courseId: course._id,
        categoryId: selectedCategory?.value ?? "",
        path: pathname,
      });
      await addCourseToCategory({
        courseId: course._id,
        categoryId: values.category,
        path: pathname,
      });

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: `Your course has been switched to be a ${
          options?.find((option) => option.value === values.category)?.label
        } Course`,
      });
      await updateCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        data: values,
        path: pathname,
      });

      onToggleEditHandler();
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  const onToggleEditHandler = () =>
    setEdit((curr) => {
      return !course.category.name ? false : !curr;
    });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const _categories = await getAllCategories();
        setCategories(_categories);
      } catch (error: any) {
        scnToast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className=" flex flex-col gap-2 bg-slate-200/10 px-3 dark:bg-slate-800/10 rounded-sm ">
      {!edit && course.category.name ? (
        <div className="w-full flex items-center justify-between">
          <div className="">
            {selectedCategory?.label ? (
              <ShowMoreLess text={selectedCategory?.label} />
            ) : (
              <Spinner />
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
            {!edit && course.category.name ? (
              <PencilLineIcon size={15} className="text-slate-600" />
            ) : (
              <XCircle size={15} className="text-slate-600" />
            )}
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox options={options} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-end items-center gap-2">
              <Button
                size="sm"
                disabled={!course?.category}
                onClick={onToggleEditHandler}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#FF782D] hover:bg-[#FF782D]"
                disabled={
                  !isValid ||
                  isSubmitting ||
                  form.getValues().category === selectedCategory?.value
                }
              >
                {isSubmitting ? (
                  <Spinner size={20} className="text-slate-500" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default CategoryForm;
