"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FramerMotion = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const transformedScrollYProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0.8, 1]
  );
  const transformedOpacityProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0.6, 1]
  );
  return (
    <motion.div
      className={className ? className : ""}
      ref={ref}
      style={{
        scale: transformedScrollYProgress,
        opacity: transformedOpacityProgress,
      }}
    >
      {children}
    </motion.div>
  );
};

export default FramerMotion;
