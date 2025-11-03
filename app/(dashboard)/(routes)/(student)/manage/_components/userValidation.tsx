import { z } from "zod";

export const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().min(1, { message: "Invalid email address" }),
  picture: z.string().optional(),
  aboutMe: z.string().optional(),
  socialLinks: z
    .object({
      website: z.string().url().optional().or(z.literal("")),
      linkedin: z.string().url().optional().or(z.literal("")),
      youtube: z.string().url().optional().or(z.literal("")),
      github: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});
