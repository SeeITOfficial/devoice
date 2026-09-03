"use client";

import { useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
  audioUrl: string;
  title: string;
};

export default function AudioPlayer({
  audioUrl,
  title,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    function handleTimeUpdate() {
      setCurrentTime(audio?.currentTime ?? 0);
    }

    function handleLoadedMetadata() {
      setDuration(audio?.duration ?? 0);
    }

    function handleEnded() {
      setPlaying(false);
      setCurrentTime(0);
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );
      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, []);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextTime = Number(event.target.value);

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#0d1a17]/10 bg-[#f2e9d8]/55 px-3 py-2.5 transition-colors hover:border-[#b18a3b]/50">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />

      <button
        type="button"
        onClick={togglePlayback}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d1a17] text-[#f2e9d8] transition-colors hover:bg-[#0a4a48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b18a3b]"
        aria-label={`${playing ? "Pause" : "Play"} ${title}`}
      >
        <span aria-hidden="true" className="text-xs">
          {playing ? "Ⅱ" : "▶"}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#0d1a17]/10 accent-[#b18a3b] [&::-moz-range-progress]:bg-[#b18a3b] [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#b18a3b] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#b18a3b]"
          style={{
            background: `linear-gradient(to right, #b18a3b ${progress}%, rgba(13, 26, 23, 0.1) ${progress}%)`,
          }}
          aria-label={`${title} playback position`}
        />

        <div className="mt-1 flex justify-between text-[10px] font-medium tabular-nums text-[#0d1a17]/45">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}