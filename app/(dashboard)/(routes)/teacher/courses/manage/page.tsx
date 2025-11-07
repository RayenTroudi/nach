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
import { CourseTypeEnum } from "@/lib/enums";
import { Video, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

const CreateCoursePage = () => {
  const { setIsLoading } = usePageLoader();
  const router = useRouter();
  const [categories, setCategories] = useState<TCategory[]>([]); // [1
  const [step, setStep] = useState<number>(0);
  const [courseType, setCourseType] = useState<CourseTypeEnum | "">("");
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showCongratsAnimation, setShowCongratsAnimation] =
    useState<boolean>(false);

  const onCreateCourseHandler = async () => {
    try {
      setIsLoading(true);
      
      console.log("📝 Creating course with:");
      console.log("  - Title:", courseTitle);
      console.log("  - Category:", courseCategory);
      console.log("  - Type:", courseType);
      
      const newCourse = await createCourse({
        courseTitle,
        courseCategory,
        courseType: courseType as CourseTypeEnum,
        path: "/teacher/courses",
      });

      console.log("✅ Course created:", newCourse);

      setShowCongratsAnimation(true);
      setTimeout(() => {
        setShowCongratsAnimation(false);
        // Redirect to the course manage page
        router.push(`/teacher/courses/manage/${newCourse._id}`);
      }, 2000);
      setTimeout(
        () =>
          scnToast({
            variant: "success",
            title: "Congrats !",
            description: "Your Course has been created successfully.",
          }),
        2500
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
        {step === 0 ? (
          <CourseCreationStep
            setStep={setStep}
            currentStep={1}
            totalSteps={3}
            stepTitle="What type of course do you want to create?"
            stepSubTitle="Choose the format that best fits your content"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card
                className={`p-6 cursor-pointer border-2 transition-all hover:shadow-lg ${
                  courseType === CourseTypeEnum.Regular
                    ? "border-brand-red-500 bg-brand-red-50 dark:bg-brand-red-950/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-brand-red-300"
                }`}
                onClick={() => setCourseType(CourseTypeEnum.Regular)}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                      Regular Course
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Full-featured course with multiple sections, videos, exams, and certificates
                    </p>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p>✓ Multiple sections & videos</p>
                    <p>✓ Welcome & congratulations messages</p>
                    <p>✓ Exams & certificates</p>
                    <p>✓ Custom pricing</p>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer border-2 transition-all hover:shadow-lg ${
                  courseType === CourseTypeEnum.Most_Frequent_Questions
                    ? "border-brand-red-500 bg-brand-red-50 dark:bg-brand-red-950/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-brand-red-300"
                }`}
                onClick={() => {
                  console.log("🎬 FAQ Reel selected");
                  setCourseType(CourseTypeEnum.Most_Frequent_Questions);
                }}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-brand-red-100 dark:bg-brand-red-900/30 rounded-full">
                    <Video className="w-8 h-8 text-brand-red-600 dark:text-brand-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                      FAQ Reel
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Short, focused video answering a frequently asked question
                    </p>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p>✓ Single video upload</p>
                    <p>✓ Quick & simple setup</p>
                    <p>✓ Featured on homepage</p>
                    <p>✓ Always free for students</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="w-full flex justify-end mt-6">
              <Button
                size="lg"
                type="button"
                disabled={!courseType}
                onClick={() => setStep((curr) => curr + 1)}
                className="bg-brand-red-500 opacity-80 hover:bg-brand-red-500 hover:opacity-100 text-slate-50"
              >
                Continue
              </Button>
            </div>
          </CourseCreationStep>
        ) : null}
        {step === 1 ? (
          <CourseCreationStep
            setStep={setStep}
            currentStep={2}
            totalSteps={3}
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
                className="bg-brand-red-500 opacity-80 hover:bg-brand-red-500 hover:opacity-100 text-slate-50"
              >
                Continue
              </Button>
            </div>
          </CourseCreationStep>
        ) : null}
        {step === 2 ? (
          <CourseCreationStep
            setStep={() => setStep(0)}
            currentStep={3}
            totalSteps={3}
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
