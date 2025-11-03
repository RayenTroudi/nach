"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { TUser } from "@/types/models.types";

export const AnimatedTooltip = ({
  items,
  otherStyles,
}: {
  items: TUser[];
  otherStyles?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  return (
    <>
      {items.map((item: TUser, idx) => (
        <div
          className={`flex items-center relative group
            ${otherStyles ? "-mr-2" : ""}
          `}
          key={item._id}
          onMouseEnter={() => setHoveredIndex(item._id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {hoveredIndex === item._id && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 10,
                },
              }}
              exit={{ opacity: 0, y: 20, scale: 0.6 }}
              style={{
                translateX: translateX,
                rotate: rotate,
                whiteSpace: "nowrap",
              }}
              className=" absolute -top-16 -left-12 flex text-xs  flex-col items-center justify-center rounded-md bg-slate-100 dark:bg-slate-950 z-50 shadow-xl px-4 py-2"
            >
              <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px " />
              <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px " />
              <div className="font-bold text-slate-950 dark:text-slate-50 relative z-30 text-base">
                {item.username}
              </div>
              <div className="text-slate-800 dark:text-slate-200 text-xs">
                User
              </div>
            </motion.div>
          )}
          <Image
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.picture!}
            alt={`${item.username}_${item._id}`}
            className={`object-cover !m-0 !p-0 object-top rounded-full  border-2 group-hover:scale-105 group-hover:z-30 border-slate-500 dark:border-slate-300  relative transition duration-500
              ${otherStyles ? otherStyles : "w-12 h-12"}
            `}
          />
        </div>
      ))}
    </>
  );
};
