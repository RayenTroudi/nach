"use server";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";
import User from "../models/user.model";
import Course from "../models/course.model";

type FindCriteria = {
  [key: string]: any;
};

export async function globalSearch(params: SearchParams) {
  const SearchableTypes = ["instructor", "course"];
  try {
    await connectToDatabase();
    const { query, type } = params;
    const regexQuery = { $regex: query, $options: "i" };

    let results = [];

    const modelsAndTypes = [
      {
        model: User,
        searchField: "username",
        type: "instructor",
        additionalCriteria: {
          createdCourses: { $exists: true, $not: { $size: 0 } },
        },
      },
      {
        model: Course,
        searchField: "title",
        type: "course",
        additionalCriteria: { isPublished: true },
      },
    ];
    const typeLower = type?.toLowerCase();

    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      for (const {
        model,
        searchField,
        type,
        additionalCriteria,
      } of modelsAndTypes) {
        let findCriteria: FindCriteria = { [searchField]: regexQuery };

        if (additionalCriteria) {
          findCriteria = { ...findCriteria, ...additionalCriteria };
        }

        const queryResults = await model.find(findCriteria).limit(2);
        results.push(
          ...queryResults.map((item) => {
            let picture = "";
            if (type === "course") {
              picture = item.thumbnail;
            } else if (type === "instructor") {
              picture = item.picture;
            }
            return {
              title: type === "course" ? item.title : item[searchField],
              type,
              id: item._id.toString(),
              picture,
            };
          })
        );
      }
    } else {
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);

      if (!modelInfo) {
        throw new Error("Invalid search type");
      }

      let findCriteria: FindCriteria = { [modelInfo.searchField]: regexQuery };

      if (modelInfo.additionalCriteria) {
        findCriteria = { ...findCriteria, ...modelInfo.additionalCriteria };
      }
      const queryResults = await modelInfo.model.find(findCriteria).limit(8);
      results = queryResults.map((item) => {
        let picture = "";
        if (typeLower === "course") {
          picture = item.thumbnail;
        } else if (typeLower === "instructor") {
          picture = item.picture;
        }

        return {
          title:
            typeLower === "course" ? item.title : item[modelInfo.searchField],
          type: typeLower,
          id: item._id.toString(),
          picture,
        };
      });
    }

    return JSON.stringify(results);
  } catch (error) {
    console.error(`❌ Error fetching global search results: ${error} ❌`);
    throw error;
  }
}
