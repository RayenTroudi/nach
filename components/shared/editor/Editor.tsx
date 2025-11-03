"use client";
import React, { useRef } from "react";
import { Noop } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeProvider";
import { Editor as TinyEditor } from "@tinymce/tinymce-react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

interface Props {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  initialValue: string;
  defaultHeight?: number;
}

const Editor = ({
  onChange,
  onBlur,
  initialValue,
  defaultHeight = 300,
}: Props) => {
  const { mode } = useTheme();

  const editorRef = useRef(null);
  return (
    <TinyEditor
      id="editor"
      onBlur={onBlur}
      onEditorChange={(content: string) => onChange(content)}
      apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY!}
      onInit={(evt: any, editor: any) => {
        // @ts-ignore
        editorRef.current = editor;
      }}
      initialValue={initialValue}
      init={{
        height: defaultHeight,
        menubar: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "print",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "codesample",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "paste",
          "wordcount",
        ],
        toolbar:
          "undo redo | formatselect | " +
          "codesample | link | bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",

        content_style:
          "body { font-family:Inter,sans-serif; font-size:16px;  }",
        skin: mode === "dark" ? "oxide-dark" : "oxide",
        content_css: mode === "dark" && "dark",
      }}
    />
  );
};

export default Editor;
