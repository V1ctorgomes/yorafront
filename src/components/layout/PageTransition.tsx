"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/features/navigation/navigation-context";
import type { NavTransitionDirection } from "@/features/navigation/navigation-context";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

type Phase = "idle" | "exit" | "enter";

const EXIT_DURATION = 340;
const ENTER_DURATION = 520;

function getPhaseClasses(phase: Phase, direction: NavTransitionDirection) {
  if (phase === "exit") {
    if (direction === "forward") return "animate-page-route-out-forward";
    if (direction === "backward") return "animate-page-route-out-backward";
    return "animate-page-route-out";
  }

  if (phase === "enter") {
    if (direction === "forward") return "animate-page-route-in-forward";
    if (direction === "backward") return "animate-page-route-in-backward";
    return "animate-page-route-in";
  }

  return undefined;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { getTransitionDirection } = useNavigation();
  const [phase, setPhase] = useState<Phase>("enter");
  const [direction, setDirection] =
    useState<NavTransitionDirection>("neutral");
  const [visibleChildren, setVisibleChildren] = useState(children);
  const isFirstRender = useRef(true);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      pathnameRef.current = pathname;
      setVisibleChildren(children);
      const timer = setTimeout(() => setPhase("idle"), ENTER_DURATION);
      return () => clearTimeout(timer);
    }

    if (pathnameRef.current === pathname) {
      setVisibleChildren(children);
      return;
    }

    const nextDirection = getTransitionDirection(
      pathnameRef.current,
      pathname,
    );

    setDirection(nextDirection);
    setPhase("exit");

    let enterTimer: ReturnType<typeof setTimeout>;

    const exitTimer = setTimeout(() => {
      pathnameRef.current = pathname;
      setVisibleChildren(children);
      setPhase("enter");

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      enterTimer = setTimeout(() => {
        setPhase("idle");
      }, ENTER_DURATION);
    }, EXIT_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(enterTimer);
    };
  }, [pathname, children, getTransitionDirection]);

  return (
    <div
      className={cn(
        "min-h-full transform-gpu overflow-x-hidden",
        getPhaseClasses(phase, direction),
      )}
    >
      {visibleChildren}
    </div>
  );
}
