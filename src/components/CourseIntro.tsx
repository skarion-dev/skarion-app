"use client";
import { useEffect, useRef, useState } from "react";
import { useScrollContainer } from "./Common/ScrollContainerContext";

const CourseIntro = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useScrollContainer();

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        root: scrollContainerRef?.current ?? null,
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [scrollContainerRef]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={sentinelRef} className="w-full h-full" />
      {isVisible ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover z-5"
        >
          {shouldLoad && <source src="/1217.mp4" type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-300" />
      )}
    </div>
  );
};

export default CourseIntro;
