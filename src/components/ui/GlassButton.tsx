"use client";

import { ButtonHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassButtonProps = HTMLMotionProps<"button"> & ButtonHTMLAttributes<HTMLButtonElement>;

export function GlassButton({ className, children, ...props }: GlassButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "glass-button rounded-lg px-4 py-2 font-medium text-sm text-white",
        "flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
