"use client";
import { motion, easeInOut } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";
 
export interface LogoLoaderProps {
  size?: number | string;
  color?: string;
  className?: string;
  duration?: number;
}

export const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 32,
  color = "#5248ff",
  className,
  duration = 1,
}) => {
  const paths = [
    "m 20,16 h 9 c 1.108,0 2,0.669 2,1.5 0,0.831 -0.892,1.5 -2,1.5 h -9 c -1.108,0 -2,-0.669 -2,-1.5 0,-0.831 0.892,-1.5 2,-1.5 z",
    "m 20,27 h 18 c 1.108,0 2,0.669 2,1.5 0,0.831 -0.892,1.5 -2,1.5 H 20 c -1.108,0 -2,-0.669 -2,-1.5 0,-0.831 0.892,-1.5 2,-1.5 z",
    "m 19.5,16 c 0.831,0 1.5,0.892 1.5,2 v 10 c 0,1.108 -0.669,2 -1.5,2 C 18.669,30 18,29.108 18,28 V 18 c 0,-1.108 0.669,-2 1.5,-2 z",
    "m 29.5,16 c 0.831,0 1.5,0.892 1.5,2 v 18 c 0,1.108 -0.669,2 -1.5,2 C 28.669,38 28,37.108 28,36 V 18 c 0,-1.108 0.669,-2 1.5,-2 z",
  ];

  const sizeValue = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="16 14 26 26"
      width={sizeValue}
      height={sizeValue}
      className={cn("h-25 w-30 mx-auto", className)}
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration,
            delay: i * 0.15,
            ease: easeInOut,
            repeat: Infinity,
            repeatType: "reverse" as const,
          }}
        />
      ))}
    </svg>
  );
};