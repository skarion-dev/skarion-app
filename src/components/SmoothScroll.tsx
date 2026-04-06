"use client";
import { useEffect, useRef, PropsWithChildren } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { ScrollContainerContext } from "./Common/ScrollContainerContext";

type SmoothScrollProps = PropsWithChildren<{
  duration?: number;
  className?: string;
}>;

export default function SmoothScroll({
  children,
  duration = 1.2,
  className = "",
}: SmoothScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const wrapper = containerRef.current;
    const content = contentRef.current;

    if (!wrapper || !content) return;

    const lenis = new Lenis({
      duration,
      wrapper,
      content,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [duration]);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper) return;
    wrapper.scrollTop = 0;

    try {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    } catch {}
  }, [pathname]);

  return (
    <ScrollContainerContext.Provider value={containerRef}>
      <div
        id="smooth-scroll-container"
        ref={containerRef}
        className={`h-screen w-full overflow-y-auto overflow-x-hidden ${className}`}
      >
        <div
          id="smooth-scroll-content"
          ref={contentRef}
          className="min-h-screen"
        >
          {children}
        </div>
      </div>
    </ScrollContainerContext.Provider>
  );
}
