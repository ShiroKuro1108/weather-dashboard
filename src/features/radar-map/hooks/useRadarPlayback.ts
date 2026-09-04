/**
 * Hook to manage Radar animation playback loop and timeline controls
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import type { RadarFrame } from "../types/radarTypes";

interface UseRadarPlaybackProps {
  frames: RadarFrame[];
  defaultSpeedMs?: number;
  autoPlay?: boolean;
}

export function useRadarPlayback({ frames, defaultSpeedMs = 550, autoPlay = true }: UseRadarPlaybackProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(defaultSpeedMs);

  // Default to the latest "past" (live current) frame when frames are loaded
  useEffect(() => {
    if (frames.length > 0) {
      const nowIndex = frames.findIndex((f) => f.type === "nowcast");
      if (nowIndex > 0) {
        setCurrentFrameIndex(nowIndex - 1);
      } else {
        setCurrentFrameIndex(frames.length - 1);
      }
    }
  }, [frames]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
    }, playbackSpeedMs);

    return () => clearInterval(timer);
  }, [isPlaying, frames.length, playbackSpeedMs]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  const nextFrame = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => (prev + 1) % (frames.length || 1));
  }, [frames.length]);

  const prevFrame = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => (prev - 1 + (frames.length || 1)) % (frames.length || 1));
  }, [frames.length]);

  const jumpToNow = useCallback(() => {
    setIsPlaying(false);
    const nowIndex = frames.findIndex((f) => f.type === "nowcast");
    if (nowIndex > 0) {
      setCurrentFrameIndex(nowIndex - 1);
    } else if (frames.length > 0) {
      setCurrentFrameIndex(frames.length - 1);
    }
  }, [frames]);

  const currentFrame = useMemo(() => {
    return frames[currentFrameIndex] || null;
  }, [frames, currentFrameIndex]);

  return {
    currentFrameIndex,
    setCurrentFrameIndex,
    currentFrame,
    isPlaying,
    playbackSpeedMs,
    setPlaybackSpeedMs,
    togglePlay,
    play,
    pause,
    nextFrame,
    prevFrame,
    jumpToNow,
  };
}
