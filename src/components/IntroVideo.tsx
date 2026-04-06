"use client";
import { useEffect, useRef, useState } from "react";
import { useScrollContainer } from "./Common/ScrollContainerContext";

const VideoComponent = () => {
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
    <div className="w-full">
      <div ref={sentinelRef} className="w-full h-[1px]" />
      {isVisible ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-auto object-contain"
        >
          {shouldLoad && <source src="/intro.mp4" type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-[180px] sm:h-[220px] md:h-[260px] bg-gray-300" />
      )}
    </div>
  );
};

export default VideoComponent;
