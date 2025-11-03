import { z } from "zod";

export const languageOptions = ["English", "Spanish", "French"] as const;
export const levelOptions = ["beginner", "intermediate", "advanced"] as const;
export const Rating = ["5", "4", "3", "2", "1"] as const;
export type Category = { name: string };

export const CourseFilterValidator = z.object({
  language: z.array(z.enum(languageOptions)),
  level: z.array(z.enum(levelOptions)),
  rating: z.array(z.enum(Rating)),

  price: z.tuple([z.number(), z.number()]),
  category: z.array(z.string()),
});

export type CourseState = Omit<
  z.infer<typeof CourseFilterValidator>,
  "price"
> & {
  price: { isCustom: boolean; range: [number, number] };
  category: Category[];
};
