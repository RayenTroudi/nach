"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PencilLineIcon, Package, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { updateVideo } from "@/lib/actions/video.action";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/enums";
import { TSection } from "@/types/models.types";

interface DocumentBundle {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  thumbnail?: string;
  isPublished: boolean;
}

interface Props {
  video: {
    _id: string;
    filePacks?: DocumentBundle[] | string[];
    sectionId: TSection;
  };
}

const VideoFilePacksForm = ({ video }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [editing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingBundles, setIsFetchingBundles] = useState<boolean>(false);
  const [selectedFilePacks, setSelectedFilePacks] = useState<string[]>([]);
  const [availableBundles, setAvailableBundles] = useState<DocumentBundle[]>([]);

  // Initialize selected file packs
  useEffect(() => {
    if (video.filePacks && video.filePacks.length > 0) {
      const filePackIds = video.filePacks.map((pack: any) => 
        typeof pack === "string" ? pack : pack._id
      );
      setSelectedFilePacks(filePackIds);
    }
  }, [video.filePacks]);

  // Fetch available document bundles when editing
  useEffect(() => {
    const fetchBundles = async () => {
      if (editing && availableBundles.length === 0 && video?.sectionId?.course?.instructor?._id) {
        setIsFetchingBundles(true);
        try {
          const instructorId = video.sectionId.course.instructor._id;
          const response = await fetch(`/api/document-bundles?instructorId=${instructorId}&published=true`);
          if (!response.ok) throw new Error("Failed to fetch document bundles");
          const data = await response.json();
          setAvailableBundles(data.bundles || []);
        } catch (error: any) {
          scnToast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to fetch available file packs",
          });
        } finally {
          setIsFetchingBundles(false);
        }
      }
    };
    fetchBundles();
  }, [editing, availableBundles.length, video?.sectionId?.course?.instructor?._id]);

  // Safety check for nested properties - AFTER hooks
  if (!video?.sectionId?.course) {
    return (
      <div className="bg-slate-200/50 dark:bg-slate-900 border-input shadow-md w-full border rounded-sm p-4">
        <p className="text-red-500">Error: Video data is incomplete</p>
      </div>
    );
  }

  const toggleFilePack = (bundleId: string) => {
    setSelectedFilePacks((prev) =>
      prev.includes(bundleId)
        ? prev.filter((id) => id !== bundleId)
        : [...prev, bundleId]
    );
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await updateVideo({
        videoId: video._id,
        courseId: video.sectionId.course._id,
        instructorId: video.sectionId.course.instructor._id,
        data: { filePacks: selectedFilePacks },
        path: pathname,
      });
      await updateCourseStatus({
        courseId: video.sectionId.course._id,
        status:
          video.sectionId.course.status !== CourseStatusEnum.Draft
            ? CourseStatusEnum.Pending
            : video.sectionId.course.status,
        path: pathname,
      });
      setIsEditing(false);
      scnToast({
        variant: "success",
        title: "Success",
        description: "File packs updated successfully",
      });
      router.refresh();
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

  const currentFilePacks = video.filePacks?.filter((pack: any) => 
    typeof pack === "object" && pack !== null
  ) as DocumentBundle[] || [];

  return (
    <div className="bg-slate-200/50 shadow-md w-full border border-input dark:bg-slate-900 rounded-sm p-4 flex flex-col gap-2 font-semibold justify-start">
      <div className="flex items-center gap-2">
        <Package size={20} className="text-slate-500 dark:text-slate-300" />
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Purchasable File Packs
        </h2>
      </div>
      
      {!editing ? (
        <div className="w-full flex items-start justify-between">
          <div className="flex-1">
            {currentFilePacks.length > 0 ? (
              <div className="space-y-2">
                {currentFilePacks.map((pack) => (
                  <div
                    key={pack._id}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-md border border-slate-300 dark:border-slate-700"
                  >
                    <Package size={16} className="text-brand-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        {pack.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {pack.price} {pack.currency.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-normal text-slate-400 dark:text-slate-500 italic">
                No file packs added yet. Add file packs that users can purchase directly from this video.
              </p>
            )}
          </div>
          <PencilLineIcon
            size={15}
            className="cursor-pointer text-slate-600 dark:text-slate-200 flex-shrink-0 ml-2"
            onClick={() => setIsEditing(true)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {isFetchingBundles ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={24} className="text-brand-red-500" />
            </div>
          ) : availableBundles.length === 0 ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                No published document bundles available. Create and publish document bundles first to add them to videos.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Select file packs to offer with this video:
              </p>
              {availableBundles.map((bundle) => (
                <div
                  key={bundle._id}
                  onClick={() => toggleFilePack(bundle._id)}
                  className={`flex items-center gap-3 p-3 rounded-md border-2 cursor-pointer transition-all ${
                    selectedFilePacks.includes(bundle._id)
                      ? "border-brand-red-500 bg-brand-red-50 dark:bg-brand-red-950/20"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-red-300 dark:hover:border-brand-red-700"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 ${
                      selectedFilePacks.includes(bundle._id)
                        ? "bg-brand-red-500 border-brand-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selectedFilePacks.includes(bundle._id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Package size={18} className="text-brand-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate">
                      {bundle.title}
                    </p>
                    {bundle.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {bundle.description}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-brand-red-600 dark:text-brand-red-400">
                      {bundle.price} {bundle.currency.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="w-full flex items-center gap-2 justify-end pt-2 border-t border-slate-300 dark:border-slate-700">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                // Reset to original selection
                const originalPacks = video.filePacks?.map((pack: any) =>
                  typeof pack === "string" ? pack : pack._id
                ) || [];
                setSelectedFilePacks(originalPacks);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-brand-red-500 hover:bg-brand-red-600 dark:text-slate-50"
              onClick={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size={18} className="text-slate-50" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFilePacksForm;
