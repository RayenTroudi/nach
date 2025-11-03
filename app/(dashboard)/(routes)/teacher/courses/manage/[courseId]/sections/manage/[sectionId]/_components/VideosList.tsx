"use client";
import React, { useEffect, useState } from "react";
import { ListVideoIcon, PencilLineIcon, XCircle } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Spinner } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { TVideo } from "@/types/models.types";

interface Props {
  videos: TVideo[];
  deletedVideoId: string | null;
  isReording: boolean;
  onEdit: (videosId: string) => void;
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onDeleteVideo: (videoId: string) => void;
}

const VideosList = ({
  videos,
  deletedVideoId,
  isReording,
  onEdit,
  onReorder,
  onDeleteVideo,
}: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [videosList, setVideosList] = useState<TVideo[]>(videos);

  const onDragEndHandler = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(videosList);
    const [itemToReorder] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, itemToReorder);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedSections = items.slice(startIndex, endIndex + 1);
    setVideosList(items);

    const updatedData = updatedSections.map((video) => ({
      id: video._id,
      position: items.findIndex((item) => item._id === video._id) + 1,
    }));

    onReorder(updatedData);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setVideosList(videos);
  }, [videos]);

  if (!isMounted) return null;
  return (
    <DragDropContext onDragEnd={onDragEndHandler}>
      <Droppable droppableId="videos">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`relative ${isReording ? "cursor-none opacity-45" : ""}`}
          >
            {isReording ? (
              <div className="absolute !opacity-100 left-0 top-0 w-full h-full flex items-center justify-center">
                <Spinner size={50} />
              </div>
            ) : null}
            {videosList.map((video, index) => (
              <Draggable key={video._id} draggableId={video._id} index={index}>
                {(provided) => (
                  <div
                    className={`mb-2 flex items-center gap-x-2   bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-input rounded-sm`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={provided.draggableProps.style as React.CSSProperties}
                  >
                    <div
                      className={`shadow-md  hover:bg-slate-200 dark:hover:bg-slate-950 px-2 py-3 border-r border-r-slate-300 hover:bg.slate-300 rounded-l-md transition-all`}
                      {...provided.dragHandleProps}
                    >
                      <ListVideoIcon size={20} />
                    </div>
                    <div
                      className="  w-full flex items-center justify-between  rounded-md px-2 "
                      key={video._id}
                    >
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => onEdit(video._id)}
                      >
                        <p className="text-md font-bold text-slate-700 dark:text-slate-200 line-clamp-1 ">
                          <span className="font-bold"> {index + 1} - </span>
                          <span>{video?.title}</span>
                        </p>
                      </div>

                      <div className="flex items-center  gap-x-6">
                        <div className="flex items-center gap-x-1">
                          {video?.isPublished ? (
                            <Badge className="bg-[#065f46] hover:bg-[#065f46] text-slate-200 font-bold">
                              Published
                            </Badge>
                          ) : (
                            <Badge className=" text-slate-200 dark:bg-slate-950 font-bold">
                              Draft
                            </Badge>
                          )}
                          {video.isFree ? (
                            <Badge className="bg-[#065f46] hover:bg-[#065f46] text-slate-200 font-bold">
                              Free
                            </Badge>
                          ) : null}
                        </div>

                        {deletedVideoId === video._id ? (
                          <Spinner size={15} />
                        ) : (
                          <XCircle
                            size={15}
                            color="red"
                            className="text-slate-600 dark:text-slate-200 cursor-pointer"
                            onClick={() => onDeleteVideo(video._id)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default VideosList;
