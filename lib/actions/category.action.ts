"use server";

import mongoose from "mongoose";
import Category, { ICategory } from "../models/category.model";
import { connectToDatabase } from "../mongoose";

import Course from "../models/course.model";
import {
  CreateCategoryParams,
  GetCategoryById,
  ToggleCourseToCategory,
} from "@/types/shared.types";
import { revalidatePath } from "next/cache";

export const getCategoryById = async (params: GetCategoryById) => {
  try {
    connectToDatabase();
    if (!mongoose.isValidObjectId(params.id)) {
      throw new Error("Invalid category id");
    }

    const category = await Category.findById(params.id);
    return JSON.parse(JSON.stringify(category));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createCategory = async (params: CreateCategoryParams) => {
  try {
    connectToDatabase();
    const { name, path } = params;
    const category = Category.create({ name });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.log(error);
  }
};

export const getAllCategories = async () => {
  try {
    connectToDatabase();
    const categories: ICategory[] = await Category.find().populate("courses");
    return JSON.parse(JSON.stringify(categories));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const addCourseToCategory = async (params: ToggleCourseToCategory) => {
  const { categoryId, courseId, path } = params;
  try {
    connectToDatabase();
    await Category.findByIdAndUpdate(categoryId, {
      $push: { courses: courseId },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const removeCourseFromCategory = async (
  params: ToggleCourseToCategory
) => {
  const { categoryId, courseId, path } = params;
  try {
    connectToDatabase();
    await Category.findByIdAndUpdate(categoryId, {
      $pull: { courses: courseId },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCategoryIdByName = async (categoryName: string) => {
  try {
    const category = await Category.findOne({ name: categoryName });
    return JSON.parse(JSON.stringify(category ? category._id : null));
  } catch (error) {
    console.error("Error fetching category ID by name:", error);
    return null;
  }
};

export const getCategoryNameById = async (categoryId: string) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      console.log("Category not found");
      return "";
    }

    return category.name;
  } catch (error) {
    console.error("Error fetching category name:", error);
    return "";
  }
};

export const getCoursesByCategoryID = async (categoryId: string) => {
  try {
    await connectToDatabase();
    const categoryName = await getCategoryNameById(categoryId);

    const courses = await Course.find({
      category: categoryId,
      isPublished: true,
    })
      .populate("instructor")
      .populate("category")
      .populate("students")
      .lean();

    const coursesWithCategoryName = courses.map((course) => {
      let mutableCourse = JSON.parse(JSON.stringify(course));

      mutableCourse.category = {
        name: categoryName,
      };

      return mutableCourse;
    });

    return coursesWithCategoryName;
  } catch (error) {
    console.error("Error fetching courses by category ID:", error);
    throw new Error("Failed to fetch courses by category ID");
  }
};
export const getCoursesByCategoryName = async (categoryName: string) => {
  try {
    await connectToDatabase();
    const category = await Category.findOne({ name: categoryName }).populate({
      path: "courses",
      match: { isPublished: true },
    });
    if (!category) {
      throw new Error("Category not found");
    }

    return JSON.parse(JSON.stringify(category.course));
  } catch (error: any) {
    console.error("Error fetching courses by category name:", error);
    throw new Error("Failed to fetch courses by category name");
  }
};

export const deleteCategoryById = async (categoryId: string) => {
  try {
    connectToDatabase();
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.courses.length > 0) {
      throw new Error("Cannot delete category with associated courses");
    }

    await Category.findByIdAndDelete(categoryId);
    return "Category deleted successfully";
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateCategoryName = async (params: {
  categoryId: string;
  name: string;
  path: string;
}) => {
  try {
    connectToDatabase();
    const { categoryId, name, path } = params;
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name: name },
      { new: true }
    );
    if (!category) {
      throw new Error("Category not found");
    }
    revalidatePath(path);

    return JSON.parse(JSON.stringify(category));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCategoryIdsByName = async (categoryNames: string[]) => {
  try {
    await connectToDatabase();

    const categories = await Category.find({
      name: { $in: categoryNames },
    });

    // Extract the _id field from each category document
    const categoryIds = categories.map((category) => category._id.toString());

    return categoryIds;
  } catch (error: any) {
    console.error("Error fetching category IDs by name:", error);
    throw new Error(error.message);
  }
};
