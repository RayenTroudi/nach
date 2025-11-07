"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PencilLineIcon, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { Combobox, ShowMoreLess, Spinner } from "@/components/shared";
import { coursePrices } from "@/constants/constants";
import { transformCurrencyToSymbol } from "@/lib/utils";
import { IUser } from "@/lib/models/user.model";
import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";
import { CourseTypeEnum } from "@/lib/enums";

const formSchema = z.object({
  price: z.string(),
  currency: z.string(),
});

interface Props {
  course: TCourse;
}

const PricingForm = ({ course }: Props) => {
  const pathname = usePathname();
  const [edit, setEdit] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<{ label: string; value: any }[]>(
    []
  );
  const router = useRouter();
  
  const isFAQCourse = course.courseType === CourseTypeEnum.Most_Frequent_Questions;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: course?.price ? course?.price.toString() : "",
      currency: course?.currency ? course?.currency : "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onToggleEditHandler = () => {
    setEdit((curr) => {
      return !course?.price || !course?.currency ? false : !curr;
    });
  };

  const currencyMeaning = currencies
    .find((currency) => currency.value === course.currency)
    ?.label.toUpperCase()
    .split("-")[1] as string;

  useEffect(() => {
    if (isFAQCourse) return; // Don't fetch currencies for FAQ courses
    
    const fetchCurrencies = async () => {
      const { data } = await axios.get(
        "https://openexchangerates.org/api/currencies.json"
      );

      const currenciesArray = Object.entries(data).map(([label, value]) => ({
        label: `${label} - ${(value as string).toUpperCase()}`,
        value: label.toLowerCase() as string,
      }));

      setCurrencies(currenciesArray);
    };

    fetchCurrencies();
  }, [isFAQCourse]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        data: values,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Course Price updated successfully.",
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

  if (isFAQCourse) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>💡 Free Content:</strong> FAQ videos are always free for students. 
          This helps maximize reach and provides value to the community.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-slate-200/10 dark:bg-slate-800/10 rounded-sm">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-2 ">
        <div className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800/20   p-6 rounded-md border border-input ">
          <div className="w-full flex items-center justify-between">
            <h3 className="text-slate-500 dark:text-slate-300 font-bold">
              Price
            </h3>
            <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
              {!edit && course.price ? (
                <PencilLineIcon
                  size={15}
                  className="text-slate-600 dark:text-slate-300"
                />
              ) : (
                <XCircle
                  size={15}
                  className="text-slate-600 dark:text-slate-300 "
                />
              )}
            </Button>
          </div>
          {!edit && course.price ? (
            <div className="break-words">
              {course?.price ? (
                <p className="font-bold text-slate-600 dark:text-slate-200 ">
                  {transformCurrencyToSymbol(
                    course?.currency?.toUpperCase() ?? "USD"
                  )}
                  {course?.price}
                </p>
              ) : (
                <Spinner />
              )}
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2 "
              >
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Combobox options={coursePrices} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </div>
        <div className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800/20 p-6 rounded-md border border-input ">
          <div className="w-full flex items-center justify-between">
            <h3 className="font-bold text-slate-500 dark:text-slate-300 ">
              Currency
            </h3>
            <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
              {!edit && course.currency ? (
                <PencilLineIcon
                  size={15}
                  className="text-slate-600 dark:text-slate-300 "
                />
              ) : (
                <XCircle
                  size={15}
                  className="text-slate-600 dark:text-slate-300 "
                />
              )}
            </Button>
          </div>
          {!edit && course?.currency ? (
            <div className="break-words">
              {course?.currency && currencies.length ? (
                <p className="text-slate-600 dark:text-slate-200  font-bold">
                  {`${transformCurrencyToSymbol(
                    course.currency.toUpperCase()
                  )}-${currencyMeaning}`}
                </p>
              ) : (
                <Spinner />
              )}
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2 "
              >
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Combobox options={currencies} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </div>
      </div>
      <div className="w-full flex justify-end">
        <div className="w-full flex justify-end items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="bg-brand-red-500 hover:bg-brand-red-600"
            onClick={() => onSubmit(form.getValues())}
            disabled={
              !isValid ||
              isSubmitting ||
              (+form.getValues().price === +(course.price ?? 0) &&
                form.getValues().currency === course.currency)
            }
          >
            {isSubmitting ? (
              <Spinner size={20} className="text-slate-500" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingForm;
