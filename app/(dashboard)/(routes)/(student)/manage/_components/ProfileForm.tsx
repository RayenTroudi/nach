"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TUser } from "@/types/models.types";
import { formSchema } from "./userValidation";
import {
  UserIcon,
  MailIcon,
  PencilLineIcon,
  GlobeIcon,
  LinkedinIcon,
  YoutubeIcon,
  Github,
} from "lucide-react";
import Image from "next/image";
import { updateUserDetails } from "@/lib/actions/user.action";
import Link from "next/link";

interface ProfileFormProps {
  user: TUser;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const [picture, setPicture] = useState(user.picture || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPictureDirty, setIsPictureDirty] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
      picture: user.picture || "",
      aboutMe: user.aboutMe || "",
      socialLinks: {
        website: user.socialLinks?.website || "",
        linkedin: user.socialLinks?.linkedin || "",
        youtube: user.socialLinks?.youtube || "",
        github: user.socialLinks?.github || "",
      },
    },
  });

  const {
    watch,
    setValue,
    formState: { isDirty, isValid },
  } = form;

  useEffect(() => {
    setValue("picture", picture);
  }, [picture, setValue]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const data = { ...values, picture };
      const response = await updateUserDetails({
        clerkId: user.clerkId,
        data,
      });
      console.log("User updated successfully", response);
      form.reset(values);
      setIsPictureDirty(false);
    } catch (error) {
      console.error("Error updating user", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result as string);
        setIsPictureDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center mb-4">
            <label htmlFor="pictureInput" className="cursor-pointer">
              <Image
                src={picture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border border-gray-300"
                height={128}
                width={128}
              />
              <Input
                id="pictureInput"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
            </label>
            <span className="text-slate-950 dark:text-slate-50">
              Click to change profile picture
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-950 dark:text-slate-50">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        placeholder="First Name"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        placeholder="Last Name"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <PencilLineIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        placeholder="Username"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <MailIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        type="email"
                        placeholder="Email"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.website"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <GlobeIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        placeholder="Website"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <LinkedinIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        placeholder="LinkedIn"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.youtube"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <YoutubeIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        placeholder="YouTube"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.github"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Github className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                      <Input
                        placeholder="Github"
                        disabled={isSubmitting}
                        {...field}
                        className="flex-1 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="aboutMe"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <PencilLineIcon className="h-5 w-5 text-slate-950 dark:text-slate-50" />
                    <Input
                      placeholder="Biography"
                      disabled={isSubmitting}
                      {...field}
                      className="flex-1 border-gray-300 rounded-md focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty && !isPictureDirty}
              className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-950 dark:text-slate-50"
            >
              {isSubmitting ? "Submitting..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;
