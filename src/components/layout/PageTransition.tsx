"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

type Phase = "idle" | "exit" | "enter";

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
      const timer = setTimeout(() => setPhase("idle"), 420);
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

      enterTimer = setTimeout(() => {
        setPhase("idle");
      }, 420);
    }, 240);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(enterTimer);
    };
  }, [pathname, children]);

  return (
    <div
      className={cn(
        "min-h-full",
        phase === "exit" && "animate-page-route-out",
        phase === "enter" && "animate-page-route-in",
      )}
    >
      {visibleChildren}
    </div>
  );
}
