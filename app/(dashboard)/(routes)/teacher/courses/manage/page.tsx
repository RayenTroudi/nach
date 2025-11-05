"use client";
import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseCreationStep, Spinner } from "@/components/shared";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import toast from "react-hot-toast";
import { getAllCategories } from "@/lib/actions/category.action";
import { createCourse } from "@/lib/actions/course.action";
import { useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";
import { TCategory } from "@/types/models.types";
import { usePageLoader } from "@/contexts/PageLoaderProvider";

const CreateCoursePage = () => {
  const { setIsLoading } = usePageLoader();
  const router = useRouter();
  const [categories, setCategories] = useState<TCategory[]>([]); // [1
  const [step, setStep] = useState<number>(1);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showCongratsAnimation, setShowCongratsAnimation] =
    useState<boolean>(false);

  const onCreateCourseHandler = async () => {
    try {
      setIsLoading(true);
      await createCourse({
        courseTitle,
        courseCategory,
        path: "/teacher/courses",
      });

      setShowCongratsAnimation(true);
      setTimeout(() => {
        setShowCongratsAnimation(false);
        router.push("/teacher/courses");
      }, 4000);
      setTimeout(
        () =>
          scnToast({
            variant: "success",
            title: "Congrats !",
            description: "Your Course has been created successfully.",
          }),
        5000
      );
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const _categories = await getAllCategories();
        setCategories(_categories);
      } catch (error) {
        toast.error("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      {showCongratsAnimation ? <ConfettiAnimation /> : null}
      <div className="p-6">
        {step === 1 ? (
          <CourseCreationStep
            setStep={setStep}
            currentStep={step}
            totalSteps={2}
            stepTitle="How about a working title?"
            stepSubTitle="It's ok if you can't think of a good title now. You can change it later."
          >
            <Input
              placeholder="e.g. Learn Nextjs 14 from scratch"
              className="text-[15px] font-semibold w-full text-slate-950 dark:text-slate-200 bg-slate-100 dark:bg-slate-900"
              onChange={(e) => setCourseTitle(e.target.value)}
            />
            <div className="w-full flex justify-between items-center">
              <p className="text-[13px] text-slate-400 font-bold">
                <span className="text-brand-red-500">{courseTitle.length}</span>/ 5
                letters
              </p>

              <Button
                size="lg"
                type="submit"
                disabled={!courseTitle || courseTitle.length < 5}
                onClick={() => setStep((curr) => curr + 1)}
                className="bg-[#FF782D] opacity-80 hover:bg-[#FF782D] hover:opacity-100 text-slate-50"
              >
                Continue
              </Button>
            </div>
          </CourseCreationStep>
        ) : null}
        {step === 2 ? (
          <CourseCreationStep
            setStep={() => setStep(0)}
            currentStep={step}
            totalSteps={2}
            stepTitle="What category best fits the knowledge you'll share?"
            stepSubTitle="If you're not sure about the right category, you can change it later."
          >
            <Select onValueChange={(e) => setCourseCategory(e)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories?.map((category, key) => (
                    <SelectItem key={key} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="w-full flex justify-end">
              <Button
                size="lg"
                type="submit"
                disabled={!courseCategory || showCongratsAnimation}
                onClick={() => onCreateCourseHandler()}
                className="bg-brand-red-500 opacity-80 hover:bg-brand-red-600 hover:opacity-100 text-slate-50"
              >
                Create Now
              </Button>
            </div>
          </CourseCreationStep>
        ) : null}
      </div>
    </>
  );
};

export default CreateCoursePage;
