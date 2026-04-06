"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
}

export default function Counter({ value, suffix = "+" }: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest: number) => Math.floor(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 2 });
    return controls.stop;
  }, [value, count]);

  return (
    <span>
      <motion.span>{rounded}</motion.span>
      {suffix && <span className="ml-2">{suffix}</span>}
    </span>
  );
}
