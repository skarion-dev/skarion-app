"use client";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useScrollContainer } from "../Common/ScrollContainerContext";
import Image from "next/image";

interface ITestimonial {
  src: string;
}

const testimonials: ITestimonial[] = [
  {
    src: "/testimonial-1.png",
  },
  {
    src: "/testimonial-2.png",
  },
  {
    src: "/testimonial-3.png",
  },
  {
    src: "/testimonial-4.png",
  },
  {
    src: "/testimonial-5.png",
  },
  {
    src: "/testimonial-6.png",
  },
  {
    src: "/testimonial-7.png",
  },
  {
    src: "/testimonial-8.png",
  },
  {
    src: "/testimonial-9.png",
  },
];

export default function Testimonials() {
  const container = useRef(null);
  const scrollContainerRef = useScrollContainer();

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: container,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [-500, 700]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-600, 1200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-1000, 900]);

  return (
    <div className="w-full bg-[#ffffff] py-10 sm:px-12 px-6 h-[200vh] overflow-hidden max-w-[1440px] mx-auto">
      <div ref={container} className="flex gap-6 overflow-hidden">
        <Column
          testimonials={[
            testimonials[6],
            testimonials[7],
            testimonials[8],
            testimonials[6],
            testimonials[7],
            testimonials[8],
          ]}
          y={y1}
          className="w-full sm:w-1/2 lg:w-1/3 "
        />
        <Column
          testimonials={[
            testimonials[0],
            testimonials[1],
            testimonials[2],
            testimonials[0],
            testimonials[1],
            testimonials[2],
          ]}
          y={y3}
          className="hidden sm:flex sm:w-1/2 lg:w-1/3 "
        />
        <Column
          testimonials={[
            testimonials[3],
            testimonials[4],
            testimonials[5],
            testimonials[3],
            testimonials[4],
            testimonials[5],
          ]}
          y={y2}
          className="hidden lg:flex lg:w-1/3 "
        />
      </div>
    </div>
  );
}

const Column = ({
  testimonials,
  y,
  className = "",
}: {
  testimonials: ITestimonial[];
  y: MotionValue<number>;
  className?: string;
}) => {
  return (
    <motion.div style={{ y }} className={`flex flex-col ${className}`}>
      {testimonials.map((item, i) => {
        return (
          <div
            key={i}
            className={`break-inside-avoid mb-6 border border-gray-300 rounded-xl flex flex-col will-change-transform transform-gpu`}
          >
            <Image
              src={item.src}
              alt="Testimonial"
              width={500}
              height={300}
              className="w-full h-auto rounded-lg"
            />
          </div>
        );
      })}
    </motion.div>
  );
};
