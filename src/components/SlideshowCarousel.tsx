"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SlideshowCarousel({ logos }: { logos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [logos.length]);

  return (
    <div className="relative rounded-[14px] w-full h-[495px] overflow-hidden hover:scale-[1.01] duration-700">
      <div
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {logos.map((logo, index) => (
          <div key={index} className="flex-shrink-0 w-full h-full relative">
            <Image
              src={logo}
              alt="logo"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
