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

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />

      <button
        type="button"
        onClick={togglePlayback}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d1a17] text-xs text-[#f2e9d8] transition-transform hover:scale-105"
        aria-label={`${playing ? "Pause" : "Play"} ${title}`}
      >
        {playing ? "Ⅱ" : "▶"}
      </button>

      <div className="min-w-0 flex-1">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-[#b18a3b]"
          aria-label={`${title} playback position`}
        />

        <div className="flex justify-between text-[10px] text-[#0d1a17]/35">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}