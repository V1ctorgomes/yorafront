"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

type Phase = "idle" | "exit" | "enter";

const EXIT_DURATION = 320;
const ENTER_DURATION = 560;

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("enter");
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
  }, [pathname, children]);

  return (
    <div
      className={cn(
        "min-h-full transform-gpu",
        phase === "exit" && "animate-page-route-out",
        phase === "enter" && "animate-page-route-in",
      )}
    >
      {visibleChildren}
    </div>
  );
}
