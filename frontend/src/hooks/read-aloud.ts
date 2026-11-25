import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { noteAudio } from "@/src/data/noteAudio";
import type { Section } from "@/src/data/types";
import { useProgress } from "@/src/store/progress";

// One shared player for the recorded AI narration bundled with the app (plays offline, no credits).
const player = createAudioPlayer(null);
let modeSet = false;

export const hasNarration = (id: string) => id in noteAudio;

// Reads study-notes sections aloud with the recorded voice. Used only on the notes screen.
export function useReadAloud(topicId: string, sections: Section[]) {
  const { state, setListenSpot } = useProgress();
  const lastSaved = useRef(0);
  const ids = sections.map((x) => x.id).filter(hasNarration);
  const idsRef = useRef(ids);
  idsRef.current = ids;
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queue = useRef<string[]>([]); // section ids still to play in "read all" mode
  const current = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null); // safety net if a clip never starts

  // save = remember where listening stopped so it can be resumed later
  const stop = useCallback((save = true) => {
    if (timer.current) clearTimeout(timer.current);
    if (save && current.current) setListenSpot(topicId, { sectionId: current.current, position: Math.max(0, player.currentTime - 2), at: new Date().toISOString() });
    queue.current = [];
    current.current = null;
    player.pause();
    setPlayingId(null);
    setLoadingId(null);
    setAll(false);
  }, [topicId, setListenSpot]);

  const play = useCallback(async (id: string, from = 0) => {
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
      player.seekTo(from);
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
      if (s.playing && s.currentTime > 0 && Date.now() - lastSaved.current > 5000) {
        lastSaved.current = Date.now();
        setListenSpot(topicId, { sectionId: current.current, position: s.currentTime, at: new Date().toISOString() });
      }
      if (s.playing && s.currentTime > 0) {
        // Only show "speaking" once audio has actually started.
        if (timer.current) clearTimeout(timer.current);
        setPlayingId(current.current);
        setLoadingId(null);
      }
      if (s.didJustFinish) {
        const done = current.current;
        const next = queue.current.shift();
        if (next) return play(next);
        // Finished: next time, resume at the following section (or forget the spot at the end of the chapter).
        const after = idsRef.current[idsRef.current.indexOf(done) + 1];
        stop(false);
        setListenSpot(topicId, after ? { sectionId: after, position: 0, at: new Date().toISOString() } : null);
      }
    });
    const app = AppState.addEventListener("change", (st) => st !== "active" && stop());
    return () => {
      sub.remove();
      app.remove();
    };
  }, [play, stop, topicId, setListenSpot]);

  // Reading stays on the notes screen only: stop as soon as the user opens a quiz, flashcards, goes back, etc.
  useFocusEffect(useCallback(() => () => stop(), [stop]));

  const toggleSection = (id: string) => {
    if (playingId === id || loadingId === id) return stop();
    queue.current = [];
    setAll(false);
    play(id);
  };
  const toggleAll = () => {
    if (all) return stop();
    if (!ids.length) return;
    queue.current = ids.slice(1);
    setAll(true);
    play(ids[0]);
  };
  // Continue the whole chapter from where listening last stopped.
  const spot = state.listen[topicId];
  const resumeSpot = spot && ids.includes(spot.sectionId) ? spot : null;
  const resume = () => {
    if (!resumeSpot) return;
    queue.current = ids.slice(ids.indexOf(resumeSpot.sectionId) + 1);
    setAll(true);
    play(resumeSpot.sectionId, resumeSpot.position);
  };
  const active = playingId ?? loadingId;

  return { playingId, loadingId, active, all, error, toggleSection, toggleAll, stop: () => stop(), resume, resumeSpot };
}
