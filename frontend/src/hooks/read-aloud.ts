import * as Speech from "expo-speech";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Section } from "@/src/data/types";

// Reads study-notes sections aloud with the phone's built-in voice (on-device, free, works offline).
export function useReadAloud(sections: Section[]) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const voice = useRef<string | undefined>(undefined);
  const run = useRef(0); // bumps on every start/stop so callbacks from a stopped reading are ignored

  useEffect(() => {
    // Prefer the highest-quality English voice installed on the device.
    Speech.getAvailableVoicesAsync()
      .then((vs) => {
        const en = vs.filter((v) => v.language?.startsWith("en"));
        const best = en.find((v) => v.quality === Speech.VoiceQuality.Enhanced && v.language === "en-US") ?? en.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? en.find((v) => v.language === "en-US");
        voice.current = best?.identifier;
      })
      .catch(() => undefined);
  }, []);

  const speakFrom = useCallback(
    (index: number, continueAll: boolean, token: number) => {
      const s = sections[index];
      if (!s || token !== run.current) return;
      setPlayingId(s.id);
      const parts = [s.title + ".", ...s.points];
      parts.forEach((text, j) => {
        const last = j === parts.length - 1;
        Speech.speak(text, {
          language: "en-US",
          voice: voice.current,
          rate: 0.95,
          useApplicationAudioSession: false, // keeps playing when the iPhone silent switch is on
          onDone: last
            ? () => {
                if (token !== run.current) return;
                if (continueAll && index + 1 < sections.length) speakFrom(index + 1, true, token);
                else {
                  setPlayingId(null);
                  setAll(false);
                }
              }
            : undefined,
          onError: last
            ? () => {
                if (token !== run.current) return;
                setPlayingId(null);
                setAll(false);
              }
            : undefined,
        });
      });
    },
    [sections],
  );

  const stop = useCallback(() => {
    run.current++;
    Speech.stop();
    setPlayingId(null);
    setAll(false);
  }, []);

  // Reading stays on the notes screen only: stop as soon as the user opens a quiz, flashcards, etc.
  useFocusEffect(useCallback(() => stop, [stop]));

  const start = useCallback(
    (index: number, continueAll: boolean) => {
      run.current++;
      const token = run.current;
      Speech.stop();
      setAll(continueAll);
      speakFrom(index, continueAll, token);
    },
    [speakFrom],
  );

  const toggleSection = (id: string) => (playingId === id && !all ? stop() : start(sections.findIndex((s) => s.id === id), false));
  const toggleAll = () => (all ? stop() : start(0, true));

  return { playingId, all, toggleSection, toggleAll, stop };
}
