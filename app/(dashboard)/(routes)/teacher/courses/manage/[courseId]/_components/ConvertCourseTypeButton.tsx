"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";

interface Props {
  courseId: string;
  currentType: string;
  targetType: string;
}

export default function ConvertCourseTypeButton({ courseId, currentType, targetType }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConvert = async () => {
    if (!confirm(`Are you sure you want to convert this course from ${currentType} to ${targetType}? This action will reload the page.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/fix-course-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseType: targetType === "FAQ Reel" ? "most_frequent_questions" : "regular"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert course type');
      }

      scnToast({
        variant: "success",
        title: "Success!",
        description: `Course converted to ${targetType}. Refreshing...`,
      });

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConvert}
      disabled={loading}
      variant="outline"
      size="sm"
      className="border-yellow-500 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      Convert to {targetType}
    </Button>
  );
}
