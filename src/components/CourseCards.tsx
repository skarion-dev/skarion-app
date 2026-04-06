"use client";
import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; 

const courses = [
  {
    courseName: "Outside Plant Engineering",
    courseDescription:
      "Understand the fundamentals of fiber optics, including OSP design, splicing techniques, and network layout. Ideal for those aiming to work in telecom and infrastructure.",
    modules: 13,
    tag: "Most Popular",
    isPopular: true,
    href: "/course/outside-plant-engineering",
    image: "/osp.jpg",
    published: true,
  },
  {
    courseName: "AutoCAD Fundamentals",
    courseDescription:
      "Learn the ins and outs of AutoCAD, from basic drawing to advanced modeling. Suitable for those with a passion for design.",
    modules: 13,
    tag: "Coming Soon",
    isPopular: false,
    href: "/",
    published: false,
  },
  {
    courseName: "GIS Essentials",
    courseDescription:
      "Learn the ins and outs of GIS, from mapping to data analysis. Ideal for those with a passion for location-based services.",
    modules: 13,
    tag: "Coming Soon",
    isPopular: false,
    href: "/",
    published: false,
  },
];

export default function CourseCards() {
  const [activeId, setActiveId]: any = useState(null);

  return (
    <div className="container">
      <div className="flex gap-8 flex-wrap overflow-x-auto">
        {courses.map((course, index) => {
          const isActive = index === activeId;
          const {
            courseName,
            courseDescription,
            modules,
            tag,
            isPopular,
            published,
          } = course || {};
          const baseClasses = clsx(
            "relative bg-white border rounded-lg transition-all ease-out",
            "min-w-[270px] w-full sm:min-w-[300px]",
            isActive
              ? "lg:w-[500px] duration-300"
              : "sm:w-[300px] duration-300",
          );
          const disabledClasses = clsx(
            baseClasses,
            "opacity-60 cursor-not-allowed pointer-events-none",
          );
          const content = (
            <>
              <div className="relative rounded-lg h-[150px] m-2">
                {course.image ? (
                  <div className="absolute inset-0 bg-cover bg-center">
                    <Image
                      src={course.image}
                      alt={`${course.courseName} Background`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="relative bg-gray-300 rounded-lg h-full" />
                )}
                <div
                  className={`absolute -bottom-4 left-2 inline-flex items-center justify-center px-4 py-1 text-[11px] font-[600] rounded-full border-3 border-white z-10 ${isPopular ? "text-green-800 bg-green-200" : "text-red-800 bg-red-200"}`}
                >
                  {tag}
                </div>
              </div>
              <div className="px-4">
                <div className="mt-6 text-[20px] font-[600] text-black">
                  {courseName}
                </div>
                <div className="mt-1 text-[14px] text-gray-600 line-clamp-2">
                  {courseDescription}
                </div>
              </div>
              <div className="mt-4 px-4 pb-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">{modules} Modules</span>
              </div>
            </>
          );
          return published ? (
            <Link
              href={course.href}
              key={index}
              className={baseClasses}
              onMouseEnter={() => setActiveId(index)}
              onMouseLeave={() => setActiveId(null)}
            >
              {content}
            </Link>
          ) : (
            <div
              key={index}
              className={disabledClasses}
              aria-disabled="true"
              tabIndex={-1}
              onMouseEnter={() => setActiveId(index)}
              onMouseLeave={() => setActiveId(null)}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
