"use client";

import { useEffect, useRef, useState } from "react";

interface UseAdminOrdersSyncOptions {
  enabled?: boolean;
  intervalMs?: number;
  onSync: () => void | Promise<void>;
  isPaused?: () => boolean;
}

export function useAdminOrdersSync({
  enabled = true,
  intervalMs = 8000,
  onSync,
  isPaused,
}: UseAdminOrdersSyncOptions) {
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const onSyncRef = useRef(onSync);
  const isPausedRef = useRef(isPaused);

  onSyncRef.current = onSync;
  isPausedRef.current = isPaused;

  useEffect(() => {
    if (!enabled) return;

    async function sync() {
      if (document.visibilityState !== "visible") return;
      if (isPausedRef.current?.()) return;

      setSyncing(true);
      try {
        await onSyncRef.current();
        setLastSyncedAt(new Date());
      } finally {
        setSyncing(false);
      }
    }

    const intervalId = window.setInterval(() => {
      void sync();
    }, intervalMs);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void sync();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, intervalMs]);

  return { lastSyncedAt, syncing };
}
