"use client";
import { motion } from "framer-motion";

type Direction = "up" | "left" | "right" | "scale";

interface Props {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

const variants = {
  up: { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 48 }, visible: { opacity: 1, x: 0 } },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

const ease = [0.16, 1, 0.3, 1] as const;

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -30px 0px" }}
      variants={variants[direction]}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
