import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { noteAudio } from "@/src/data/noteAudio";
import type { Section } from "@/src/data/types";

// One shared player for the recorded AI narration bundled with the app (plays offline, no credits).
const player = createAudioPlayer(null);
let modeSet = false;

export const hasNarration = (id: string) => id in noteAudio;

// Reads study-notes sections aloud with the recorded voice. Used only on the notes screen.
export function useReadAloud(sections: Section[]) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queue = useRef<string[]>([]); // section ids still to play in "read all" mode
  const current = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null); // safety net if a clip never starts

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    queue.current = [];
    current.current = null;
    player.pause();
    setPlayingId(null);
    setLoadingId(null);
    setAll(false);
  }, []);

  const play = useCallback(async (id: string) => {
    current.current = id;
    setLoadingId(id);
    setPlayingId(null);
    setError(null);
    try {
      if (!modeSet) {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
        modeSet = true;
      }
      player.replace(noteAudio[id]);
      player.seekTo(0);
      player.play();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (current.current !== id) return;
        current.current = null;
        queue.current = [];
        player.pause();
        setPlayingId(null);
        setLoadingId(null);
        setAll(false);
        setError("Couldn't play this section. Tap to try again.");
      }, 15000);
    } catch (e) {
      console.warn("narration playback failed", e);
      setError("Couldn't play this section. Tap to try again.");
      setLoadingId(null);
      setAll(false);
      queue.current = [];
      current.current = null;
    }
  }, []);

  useEffect(() => {
    const fail = () => {
      console.warn("narration playback failed", current.current);
      stop();
      setError("Couldn't play this section. Tap to try again.");
    };
    const sub = player.addListener("playbackStatusUpdate", (s) => {
      if (!current.current) return;
      // Web reports load/play failures only through the status' error field.
      if ((s as { error?: string }).error) return fail();
      if (s.playing && s.currentTime > 0) {
        // Only show "speaking" once audio has actually started.
        if (timer.current) clearTimeout(timer.current);
        setPlayingId(current.current);
        setLoadingId(null);
      }
      if (s.didJustFinish) {
        const next = queue.current.shift();
        if (next) play(next);
        else stop();
      }
    });
    const app = AppState.addEventListener("change", (st) => st !== "active" && stop());
    return () => {
      sub.remove();
      app.remove();
    };
  }, [play, stop]);

  // Reading stays on the notes screen only: stop as soon as the user opens a quiz, flashcards, goes back, etc.
  useFocusEffect(useCallback(() => stop, [stop]));

  const toggleSection = (id: string) => {
    if (playingId === id || loadingId === id) return stop();
    queue.current = [];
    setAll(false);
    play(id);
  };
  const toggleAll = () => {
    if (all) return stop();
    const ids = sections.map((s) => s.id).filter(hasNarration);
    if (!ids.length) return;
    queue.current = ids.slice(1);
    setAll(true);
    play(ids[0]);
  };
  const active = playingId ?? loadingId;

  return { playingId, loadingId, active, all, error, toggleSection, toggleAll, stop };
}
