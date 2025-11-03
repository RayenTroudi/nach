"use client";
import React, { useEffect, useState } from "react";
import { ListVideoIcon, PencilLineIcon, XCircle } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { TSection } from "@/types/models.types";

interface Props {
  sections: TSection[];
  deletedSectionId: string | null;
  isReording: boolean;
  onEdit: (sectionId: string) => void;
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onDeleteSection: (sectionId: string) => void;
}

const SectionList = ({
  sections,
  deletedSectionId,
  isReording,
  onEdit,
  onReorder,
  onDeleteSection,
}: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [sectionsList, setSectionsList] = useState<TSection[]>(sections);

  const onDragEndHandler = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sectionsList);
    const [itemToReorder] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, itemToReorder);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedSections = items.slice(startIndex, endIndex + 1);
    setSectionsList(items);

    const updatedData = updatedSections.map((section) => ({
      id: section._id,
      position: items.findIndex((item) => item._id === section._id) + 1,
    }));

    onReorder(updatedData);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSectionsList(sections);
  }, [sections]);

  if (!isMounted) return null;
  return (
    <DragDropContext onDragEnd={onDragEndHandler}>
      <Droppable droppableId="sections">
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
            {sectionsList.map((section, index) => (
              <Draggable
                key={section._id}
                draggableId={section._id}
                index={index}
              >
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
                      className="   w-full flex items-center justify-between  rounded-md px-2 "
                      key={section._id}
                    >
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => onEdit(section._id)}
                      >
                        <p className="text-md font-bold text-slate-700 dark:text-slate-200 line-clamp-1 ">
                          <span className="font-bold"> {index + 1} - </span>
                          <span>{section?.title}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 ">
                        {section?.isPublished ? (
                          <Badge className="bg-[#065f46] hover:bg-[#065f46] text-slate-200 font-bold">
                            Published
                          </Badge>
                        ) : (
                          <Badge className=" text-slate-200 dark:bg-slate-950 font-bold">
                            Draft
                          </Badge>
                        )}
                        {deletedSectionId === section._id ? (
                          <Spinner size={15} />
                        ) : (
                          <XCircle
                            size={15}
                            color="red"
                            className="cursor-pointer dark:text-slate-200"
                            onClick={() => onDeleteSection(section._id)}
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

export default SectionList;
