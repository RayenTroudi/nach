import React from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TCourse } from "@/types/models.types";

interface MultiPurchaseDialogProps {
  courses: TCourse[];
  triggerButtonClassName: string;
}

const MultiPurchaseDialog: React.FC<MultiPurchaseDialogProps> = ({
  courses,
  triggerButtonClassName,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={triggerButtonClassName}>Buy now</Button>
      </DialogTrigger>
      <DialogOverlay className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto max-w-[625px] p-6 bg-slate-100 dark:bg-slate-950 rounded-lg shadow-lg z-50">
        {courses.map((course, index) => (
          <div key={index} className="flex flex-col gap-y-2">
            <div className="flex gap-x-3">
              <Image
                src={course.thumbnail!}
                alt="course-thumbnail"
                width={120}
                height={150}
                className="rounded-sm"
              />
              <div className="flex flex-1 flex-col gap-y-2 justify-between">
                <h2 className="text-sm md:text-xl font-bold">{course.title}</h2>
                {/* Add more details as needed */}
              </div>
            </div>
            <Separator />
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default MultiPurchaseDialog;
