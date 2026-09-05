"use client";

import { useEffect } from "react";

export default function MediaManager() {
  useEffect(() => {
    function handlePlay(event: Event) {
      const target = event.target as HTMLElement;
      if (target.tagName === "AUDIO" || target.tagName === "VIDEO") {
        const all = document.querySelectorAll<HTMLMediaElement>("audio, video");
        all.forEach((el) => {
          if (el !== target) el.pause();
        });
      }
    }

    document.addEventListener("play", handlePlay, true);
    return () => document.removeEventListener("play", handlePlay, true);
  }, []);

  return null;
}
