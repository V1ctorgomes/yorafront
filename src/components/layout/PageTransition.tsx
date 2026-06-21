"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useNavigation } from "@/features/navigation/navigation-context";
import type { NavTransitionDirection } from "@/features/navigation/navigation-context";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

function getEnterClass(direction: NavTransitionDirection) {
  if (direction === "forward") return "animate-page-enter-forward";
  if (direction === "backward") return "animate-page-enter-backward";
  return "animate-page-enter";
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { getTransitionDirection } = useNavigation();
  const previousPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  const direction: NavTransitionDirection = isFirstRender.current
    ? "neutral"
    : getTransitionDirection(previousPathname.current, pathname);

  useEffect(() => {
    isFirstRender.current = false;
    previousPathname.current = pathname;

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname]);

  return (
    <div className="overflow-x-hidden">
      <div
        key={pathname}
        className={cn("min-h-full transform-gpu", getEnterClass(direction))}
      >
        {children}
      </div>
    </div>
  );
}
