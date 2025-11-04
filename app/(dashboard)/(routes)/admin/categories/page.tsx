"use client";

export const dynamic = 'force-dynamic';

import { LeftSideBar, Spinner } from "@/components/shared";
import { getAllCategories } from "@/lib/actions";
import { ICategory } from "@/lib/models/category.model";
import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./_components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scnToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";

import {
  createCategory,
  deleteCategoryById,
  updateCategoryName,
} from "@/lib/actions/category.action";
import { Ban, CircleDashed, PencilLine, PlusCircle, Trash } from "lucide-react";
import Loading from "./loading";
import dynamicImport from "next/dynamic";
const NoResult = dynamicImport(() => import("@/components/shared/animations/NoResult"), { ssr: false });

const formSchema = z.object({
  name: z.string().max(20, {
    message: "Category name max characters is 30.",
  }),
});

const CategoriesPage = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);

  const pathname = usePathname();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoryById(id);
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Category deleted successfully.",
      });
      setRefresh(!refresh);
    } catch (error: any) {
      if (error.message === "Cannot delete category with associated courses") {
        scnToast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        console.error(error);
      }
    }
  };

  async function createNewCategory(values: z.infer<typeof formSchema>) {
    try {
      const params = {
        name: values.name,
        path: pathname,
      };
      const newCategory = await createCategory(params);
      form.reset();
      setRefresh(!refresh);
      return newCategory;
    } catch (error) {
      console.error(error);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.name === categoryName)
        return scnToast({
          variant: "default",
          title: "Info",
          description: "No changes made.",
        });

      await updateCategoryName({
        categoryId: editCategoryId ? editCategoryId : "",
        name: values.name,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Category name updated successfully.",
      });
      setEditCategoryId(null);
      form.reset();
      setRefresh(!refresh);
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  const { isValid, isSubmitting } = form.formState;

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCategories();
      setCategories(response);
    };

    fetchCategories();
  }, [refresh]);

  const columns: ColumnDef<ICategory>[] = [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => {
        if (!row.original) {
          return null;
        }

        if (row.original._id === editCategoryId) {
          return (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2 "
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="e.g. Design ..."
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="w-full flex justify-end items-center gap-2">
                  <Button
                    disabled={!!categoryName}
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditCategoryId(null);
                      form.reset();
                    }}
                  >
                    cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#FF782D] hover:bg-[#FF782D]"
                    disabled={
                      !isValid ||
                      isSubmitting ||
                      form.getValues().name === categoryName
                    }
                  >
                    {isSubmitting ? (
                      <Spinner size={20} className="text-slate-500" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          );
        } else {
          return <div className="font-semibold">{row.original.name}</div>;
        }
      },
    },
    {
      accessorKey: "Courses",
      header: "Courses",
      cell: ({ row }) => (
        <>
          {!row.original.courses.length ? (
            <div className="w-full flex items-center justify-center md:items-start md:justify-start">
              <Ban />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center md:gap-x-2 md:flex-row  md:justify-start text-sm font-semibold">
              <p className="text-[#FF782D] text-lg font-bold">
                {row.original.courses.length}
              </p>
              <p className="text-slate-400">courses</p>
            </div>
          )}
        </>
      ),
    },
    {
      accessorKey: "Actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="space-x-2 flex items-center">
          <Button
            variant={"success"}
            size={"sm"}
            onClick={() => setEditCategoryId(row.original._id)}
            className=" hover:bg-[#065f46]/80  dark:hover:bg-slate-950"
          >
            <PencilLine
              size={20}
              className="text-slate-50  w-[13px] h-[13px] lg:w-[20px] lg:h-[20px]"
            />
          </Button>

          <Button
            onClick={() => handleDelete(row.original._id)}
            variant={"destructive"}
            size={"sm"}
            className=" hover:bg-destructive/80 dark:hover:bg-slate-950 "
          >
            <Trash
              size={20}
              className="text-slate-50 w-[13px] h-[13px] lg:w-[20px] lg:h-[20px]"
            />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex">
      <LeftSideBar />

      <div className="p-6 flex flex-1 flex-col gap-4">
        {categories.length ? (
          <>
            <div className="flex gap-4 items-center justify-between">
              <h1 className="text-3xl text-slate-950 dark:text-slate-200 font-bold">
                Categories
              </h1>
              <AlertDialog>
                <AlertDialogTrigger className="flex items-center gap-x-2 bg-[#FF782D] text-slate-50 font-semibold px-4 py-2 rounded-md cursor-pointer">
                  <PlusCircle
                    size={20}
                    className="flex-shrink-0 text-slate-50"
                  />
                  <p className="hidden md:block">New category</p>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogTitle>New category</AlertDialogTitle>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(createNewCategory)}
                      className="space-y-2 "
                    >
                      <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                disabled={isSubmitting}
                                {...field}
                                value={field.value ?? ""}
                                className="w-full "
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="w-full flex justify-end items-center gap-2">
                        <AlertDialogAction
                          type="submit"
                          className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-50"
                        >
                          Add
                        </AlertDialogAction>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                      </div>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <DataTable columns={columns} data={categories} />
          </>
        ) : (
          <div className="w-full md:w-[800px] lg:w-[1000px] mx-auto flex items-center justify-center flex-col gap-y-2">
            <NoResult className="h-[300px] lg:h-[500px]" />

            <AlertDialog>
              <AlertDialogTrigger className="w-full md:w-1/2  flex items-center justify-center gap-x-2 bg-[#FF782D] text-slate-50 font-semibold px-4 py-2 rounded-md cursor-pointer">
                <PlusCircle size={20} className="flex-shrink-0 text-slate-50" />
                <p className="">New category</p>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogTitle>New category</AlertDialogTitle>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(createNewCategory)}
                    className="space-y-2 "
                  >
                    <FormField
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              disabled={isSubmitting}
                              {...field}
                              value={field.value ?? ""}
                              className="w-full "
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="w-full flex justify-end items-center gap-2">
                      <AlertDialogAction
                        type="submit"
                        className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-50"
                      >
                        Add
                      </AlertDialogAction>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </div>
                  </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
