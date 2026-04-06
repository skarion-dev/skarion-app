"use client";
import Image from "next/image";
import { useTransform, useScroll, motion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export const projects = [
  {
    title: "Personal Discovery",
    description:
      "Every journey starts with a conversation—our mentors sit down with you to map out your aspirations and craft a roadmap that fits your unique story.",
    src: "/info.webp",
    color: "#1a5244ff",
  },
  {
    title: "Immersive Learning",
    description:
      "Dive into live sessions and collaborative labs where telecom theory meets everyday practice, guided by instructors who still work in the field.",
    src: "/info2.webp",
    color: "#3372a5ff",
  },
  {
    title: "Hands-On Creation",
    description:
      "Turn knowledge into proof—build portfolio pieces from fiber-route designs to CAD drafts that mirror the challenges real crews solve on-site.",
    src: "/info3.webp",
    color: "#c9af6aff",
  },
  {
    title: "Career Coaching",
    description:
      "From résumé polish to mock interviews, our career team becomes your personal hype-squad, opening doors to telecom opportunities you didn’t know existed.",
    src: "/info4.webp",
    color: "#c96a6aff",
  },
  {
    title: "Success Sharing",
    description:
      "Land the role first, then invest in your future—our deferred tuition keeps risk low while we celebrate every job offer together.",
    src: "/info5.webp",
    color: "#747474ff",
  },
];

interface CardProps {
  title: string;
  description: string;
  src: string;
  color: string;
  i: number;
}

const Card = ({ title, description, src, color, i }: CardProps) => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    axis: "x",
    offset: ["start end", "start start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);

  return (
    <div
      ref={container}
      className="h-[80vh] sm:h-screen w-full flex items-center justify-center sticky top-50 lg:top-24 px-4 sm:px-12 my-10"
    >
      <div
        className="relative flex flex-col sm:flex-row justify-between items-center h-auto min-h-[350px] sm:h-[400px] w-full lg:w-full rounded-2xl p-6 sm:p-10 gap-5 shadow-lg overflow-hidden"
        style={{
          backgroundColor: color,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
      >
        {/* Card background image with black shade */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            fill
            src={src}
            alt={title}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent rounded-[14px] pointer-events-none z-10" />
        </div>

        {/* Text content on top of gradient */}
        <div className="absolute inset-0 w-full h-full flex items-end justify-start z-20 pointer-events-none">
          <div className="relative w-full h-full">
            {/* SVG logo placeholder */}
            {/* <div className="absolute bottom-30 left-5 sm:bottom-40 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 z-10">
              <svg
                className="w-full h-full text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
              </svg>
            </div> */}

            {/* Text content */}
            <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 right-5 sm:right-6 flex flex-col gap-2 sm:gap-3">
              <h2 className="text-[30px] sm:text-[40px] lg:text-[36px] font-[600] text-white leading-tight">
                {title}
              </h2>
              <p className="relative text-[20px] md:text-[18px] text-white/90 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-between relative w-full sm:py-10 py-5 sm:px-12 px-6 max-w-[1440px] mx-auto">
      <div className="w-full lg:w-1/2 sticky top-16 sm:top-20 md:top-24 lg:top-0 h-auto lg:h-screen flex flex-col justify-center py-3 lg:py-3 bg-white z-5">
        <div className="text-[#000000] text-[32px] sm:text-[40px] md:text-[48px] lg:text-[64px] leading-[1.2] text-left">
              Advancing Careers Through Specialized Training
          </div>
          <div className="text-[16px] sm:text-[18px] md:text-[20px] font-[300] pt-5 text-left w-full lg:w-[80%]">
              Skarion helps individuals gain the skills and experience needed to secure high-demand jobs through specialized, hands-on training.                     
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8">
            <Link
                href="https://outlook.office.com/book/SkarionConsultationCall@inuberry.com/?ismsaljsauthenabled"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#122461] rounded-[8px] px-6 py-3 flex justify-center items-center gap-2 group transition-all duration-300 cursor-pointer whitespace-nowrap"
            >
                <p className="text-[#FFFFFF] text-[12px] sm:text-[14px] font-[500] flex">
                    Book a Consultation Call
                    <span className="inline-block w-0 overflow-hidden group-hover:w-[72px] transition-all duration-300 whitespace-nowrap">
                        , It&apos;s FREE!
                    </span>
                </p>
                <svg
                    className="my-auto"
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M18.834 10.4998C18.834 5.89984 15.1007 2.1665 10.5007 2.1665C5.90065 2.1665 2.16732 5.89984 2.16732 10.4998C2.16732 15.0998 5.90065 18.8332 10.5007 18.8332C15.1007 18.8332 18.834 15.0998 18.834 10.4998ZM10.4757 13.4415C10.3507 13.3165 10.2923 13.1582 10.2923 12.9998C10.2923 12.8415 10.3507 12.6832 10.4757 12.5582L11.909 11.1248L7.58399 11.1248C7.24232 11.1248 6.95899 10.8415 6.95899 10.4998C6.95899 10.1582 7.24232 9.87484 7.58399 9.87484L11.909 9.87484L10.4757 8.4415C10.234 8.19984 10.234 7.79984 10.4757 7.55817C10.7173 7.3165 11.1173 7.3165 11.359 7.55817L13.859 10.0582C14.1007 10.2998 14.1007 10.6998 13.859 10.9415L11.359 13.4415C11.1173 13.6832 10.7173 13.6832 10.4757 13.4415Z"
                        fill="white"
                    />
                </svg>
            </Link>
        </div>
      </div>
      <div className="w-full lg:w-1/2">
        {projects.map((p, i) => (
          <Card
            key={p.title}
            {...p}
            i={i}
          />
        ))}
      </div>
    </div>
  );
}