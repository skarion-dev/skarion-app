"use client";
import { useEffect, useState } from "react";
import EnrollButton from "@/components/Course/EnrollButton";

export default function MobileCTA({ isPurchased }: { isPurchased: boolean }) {
  const [footerVisible, setFooterVisible] = useState(false);
  const [showCTA, setShowCTA] = useState(true);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setFooterVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0 },
    );
    observer.observe(footer);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (footerVisible) {
      setShowCTA(false);
    } else {
      setShowCTA(true);
    }
  }, [footerVisible]);

  return (
    <div
      className={[
        "block lg:hidden fixed bottom-0 left-0 right-0 z-50 h-[150px] bg-[#000000]/70 py-3 px-4 border-t border-black/20",
        "transition-opacity duration-500 ease-out",
        showCTA ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-white leading-[1.2] text-[24px] font-[500]">
            OSP Engineering Bootcamp
          </span>

          <EnrollButton isPurchased={isPurchased} />
        </div>
      </div>
    </div>
  );
}
