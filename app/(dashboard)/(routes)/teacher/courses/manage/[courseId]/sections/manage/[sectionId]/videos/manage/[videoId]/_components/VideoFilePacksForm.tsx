"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PencilLineIcon, Package, X, Plus, FolderOpen, Lock, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { updateVideo } from "@/lib/actions/video.action";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/enums";
import { TSection } from "@/types/models.types";

interface ParentFolder {
  _id: string;
  title: string;
  price: number;
  currency: string;
  isFolder: boolean;
}

interface DocumentBundle {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  thumbnail?: string;
  isPublished: boolean;
  isFolder?: boolean;
  parentFolder?: ParentFolder;
}

interface Breadcrumb {
  id: string | null;
  name: string;
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
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: null, name: "Root" }]);

  // Initialize selected file packs
  useEffect(() => {
    if (video.filePacks && video.filePacks.length > 0) {
      const filePackIds = video.filePacks.map((pack: any) => 
        typeof pack === "string" ? pack : pack._id
      );
      setSelectedFilePacks(filePackIds);
    }
  }, [video.filePacks]);

  // Fetch available document bundles when editing or folder changes
  useEffect(() => {
    const fetchBundles = async () => {
      if (editing && video?.sectionId?.course?.instructor?._id) {
        setIsFetchingBundles(true);
        try {
          const instructorId = video.sectionId.course.instructor._id;
          const parentParam = currentFolderId === null ? 'null' : currentFolderId;
          const response = await fetch(`/api/document-bundles?instructorId=${instructorId}&published=true&parentFolder=${parentParam}`);
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
  }, [editing, currentFolderId, video?.sectionId?.course?.instructor?._id]);

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

  const navigateToFolder = (folderId: string | null, folderTitle: string) => {
    setCurrentFolderId(folderId);
    if (folderId === null) {
      // Going to root
      setBreadcrumbs([{ id: null, name: "Root" }]);
    } else {
      // Going into a folder
      setBreadcrumbs(prev => [...prev, { id: folderId, name: folderTitle }]);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const crumb = breadcrumbs[index];
    setCurrentFolderId(crumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleItemClick = (bundle: DocumentBundle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bundle.isFolder) {
      // Navigate into the folder
      navigateToFolder(bundle._id, bundle.title);
    } else {
      // Toggle selection for non-folder items
      toggleFilePack(bundle._id);
    }
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
                {currentFilePacks.map((pack) => {
                  const isInPaidFolder = pack.parentFolder && pack.parentFolder.price > 0;
                  
                  return (
                    <div
                      key={pack._id}
                      className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-md border border-slate-300 dark:border-slate-700"
                    >
                      {isInPaidFolder ? (
                        <FolderOpen size={16} className="text-amber-500 flex-shrink-0" />
                      ) : (
                        <Package size={16} className="text-brand-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 dark:text-slate-200 truncate flex items-center gap-2">
                          {pack.title}
                          {isInPaidFolder && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                              <Lock size={10} />
                              Locked
                            </span>
                          )}
                        </p>
                        {isInPaidFolder && pack.parentFolder ? (
                          <div className="space-y-1">
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              📁 Part of: {pack.parentFolder.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Requires folder purchase: {pack.parentFolder.price} {pack.parentFolder.currency.toUpperCase()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {pack.price} {pack.currency.toUpperCase()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 1 && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id || 'root'}>
                  {index > 0 && <ChevronRight size={14} />}
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className={`hover:text-brand-red-500 transition-colors ${
                      index === breadcrumbs.length - 1 ? 'font-semibold text-brand-red-500' : ''
                    }`}
                  >
                    {index === 0 ? <Home size={14} /> : crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {isFetchingBundles ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={24} className="text-brand-red-500" />
            </div>
          ) : availableBundles.length === 0 ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {currentFolderId ? "This folder is empty." : "No published document bundles available. Create and publish document bundles first to add them to videos."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {currentFolderId ? "Select items or navigate into folders:" : "Select file packs or folders:"}
              </p>
              {availableBundles.map((bundle) => {
                const isInPaidFolder = bundle.parentFolder && bundle.parentFolder.price > 0;
                const isSelected = selectedFilePacks.includes(bundle._id);
                
                return (
                  <div
                    key={bundle._id}
                    onClick={(e) => handleItemClick(bundle, e)}
                    className={`flex items-center gap-3 p-3 rounded-md border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-red-500 bg-brand-red-50 dark:bg-brand-red-950/20"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-red-300 dark:hover:border-brand-red-700"
                    }`}
                  >
                    {/* Selection Checkbox - Only for non-folders */}
                    {!bundle.isFolder && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFilePack(bundle._id);
                        }}
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 ${
                          isSelected
                            ? "bg-brand-red-500 border-brand-red-500"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                    
                    {/* Icon - Different for folders */}
                    {bundle.isFolder ? (
                      <FolderOpen size={20} className="text-purple-500 flex-shrink-0" />
                    ) : isInPaidFolder ? (
                      <FolderOpen size={18} className="text-amber-500 flex-shrink-0" />
                    ) : (
                      <Package size={18} className="text-brand-red-500 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 dark:text-slate-200 truncate flex items-center gap-2">
                        {bundle.title}
                        {bundle.isFolder && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            (Click to open)
                          </span>
                        )}
                        {!bundle.isFolder && isInPaidFolder && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                            <Lock size={10} />
                            In Folder
                          </span>
                        )}
                      </p>
                      {bundle.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {bundle.description}
                        </p>
                      )}
                      {!bundle.isFolder && isInPaidFolder && bundle.parentFolder ? (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            📁 {bundle.parentFolder.title}
                          </p>
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {bundle.parentFolder.price} {bundle.parentFolder.currency.toUpperCase()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-brand-red-600 dark:text-brand-red-400">
                          {bundle.price} {bundle.currency.toUpperCase()}
                        </p>
                      )}
                    </div>

                    {/* Arrow indicator for folders */}
                    {bundle.isFolder && (
                      <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="w-full flex items-center gap-2 justify-end pt-2 border-t border-slate-300 dark:border-slate-700">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                // Reset navigation
                setCurrentFolderId(null);
                setBreadcrumbs([{ id: null, name: "Root" }]);
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
