"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function LogoCarousel({ logos }: { logos: string[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = scrollerRef.current;

    function addAnimation() {
      if (!scroller) return;
      const innerScroller = scroller.querySelector("inner-scroll");
      if (!innerScroller) return;
      if (innerScroller.getAttribute("data-cloned") === "true") return;
      const innerScrollerChildren = Array.from(innerScroller.children);
      innerScrollerChildren.forEach((child) => {
        const extendedLogos = child.cloneNode(true) as HTMLElement;
        innerScroller.appendChild(extendedLogos);
      });
      innerScroller.setAttribute("data-cloned", "true");
    }
  }, []);

  return (
    <div ref={scrollerRef} className="scroller">
      <div className="inner-scroll flex gap-4 animate-infinite-scroll">
        {[...logos, ...logos].map((logo, index) => (
          <div key={index} className="relative w-[100px] h-[100px] shrink-0">
            <Image
              src={logo}
              alt="logo"
              fill
              sizes="100px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
