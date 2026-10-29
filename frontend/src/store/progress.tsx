import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Topic } from "@/src/data/types";
import { storage } from "@/src/utils/storage";

const KEY = "sono_study_progress_v1";

export type CardStatus = "known" | "learning";
export type BookmarkType = "section" | "card" | "mnemonic";
export type Bookmark = { type: BookmarkType; refId: string; topicId: string; createdAt: string };
export type QuizRecord = { best: number; last: number; total: number; attempts: number; lastAt: string };
export type QuizHistory = { topicId: string; score: number; total: number; at: string };

export type ProgressState = {
  readSections: Record<string, boolean>;
  cards: Record<string, CardStatus>;
  quizzes: Record<string, QuizRecord>;
  history: QuizHistory[];
  bookmarks: Bookmark[];
  streak: { count: number; lastDate: string | null };
  missed: Record<string, boolean>;
};

const empty: ProgressState = {
  readSections: {},
  cards: {},
  quizzes: {},
  history: [],
  bookmarks: [],
  streak: { count: 0, lastDate: null },
  missed: {},
};

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return fmt(d);
}

function bump(s: ProgressState): ProgressState {
  const t = fmt(new Date());
  if (s.streak.lastDate === t) return s;
  const count = s.streak.lastDate === yesterday() ? s.streak.count + 1 : 1;
  return { ...s, streak: { count, lastDate: t } };
}

export function currentStreak(s: ProgressState) {
  const d = s.streak.lastDate;
  return d === fmt(new Date()) || d === yesterday() ? s.streak.count : 0;
}

export function topicProgress(s: ProgressState, t: Topic) {
  const read = t.sections.filter((x) => s.readSections[x.id]).length;
  const known = t.flashcards.filter((x) => s.cards[x.id] === "known").length;
  const learning = t.flashcards.filter((x) => s.cards[x.id] === "learning").length;
  const quiz = s.quizzes[t.id];
  const quizRatio = quiz ? quiz.best / quiz.total : 0;
  const pct = Math.round(((read / t.sections.length) * 0.4 + (known / t.flashcards.length) * 0.35 + quizRatio * 0.25) * 100);
  return { read, known, learning, quiz, pct };
}

type Ctx = {
  state: ProgressState;
  loaded: boolean;
  toggleRead: (sectionId: string) => void;
  setCard: (cardId: string, status: CardStatus) => void;
  recordQuiz: (topicId: string, score: number, total: number) => void;
  toggleBookmark: (type: BookmarkType, refId: string, topicId: string) => void;
  isBookmarked: (refId: string) => boolean;
  resetAll: () => void;
  markAnswer: (questionId: string, correct: boolean) => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.getItem(KEY, null as string | null).then((raw) => {
      if (raw) {
        try {
          setState({ ...empty, ...JSON.parse(raw) });
        } catch {
          // corrupted data: start fresh
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) storage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  const toggleRead = useCallback((id: string) => {
    setState((s) => {
      const readSections = { ...s.readSections };
      if (readSections[id]) delete readSections[id];
      else readSections[id] = true;
      return bump({ ...s, readSections });
    });
  }, []);

  const setCard = useCallback((id: string, status: CardStatus) => {
    setState((s) => bump({ ...s, cards: { ...s.cards, [id]: status } }));
  }, []);

  const recordQuiz = useCallback((topicId: string, score: number, total: number) => {
    setState((s) => {
      const prev = s.quizzes[topicId];
      const at = new Date().toISOString();
      const rec: QuizRecord = {
        best: Math.max(prev?.best ?? 0, score),
        last: score,
        total,
        attempts: (prev?.attempts ?? 0) + 1,
        lastAt: at,
      };
      const history = [{ topicId, score, total, at }, ...s.history].slice(0, 30);
      return bump({ ...s, quizzes: { ...s.quizzes, [topicId]: rec }, history });
    });
  }, []);

  const toggleBookmark = useCallback((type: BookmarkType, refId: string, topicId: string) => {
    setState((s) => {
      const exists = s.bookmarks.some((b) => b.refId === refId);
      const bookmarks = exists
        ? s.bookmarks.filter((b) => b.refId !== refId)
        : [{ type, refId, topicId, createdAt: new Date().toISOString() }, ...s.bookmarks];
      return { ...s, bookmarks };
    });
  }, []);

  const isBookmarked = useCallback((refId: string) => state.bookmarks.some((b) => b.refId === refId), [state.bookmarks]);

  const resetAll = useCallback(() => setState(empty), []);

  // Weak spots: wrong answers are remembered until answered correctly.
  const markAnswer = useCallback((qid: string, correct: boolean) => {
    setState((s) => {
      if (correct === !s.missed[qid]) return s;
      const missed = { ...s.missed };
      if (correct) delete missed[qid];
      else missed[qid] = true;
      return { ...s, missed };
    });
  }, []);

  const value = useMemo(
    () => ({ state, loaded, toggleRead, setCard, recordQuiz, toggleBookmark, isBookmarked, resetAll, markAnswer }),
    [state, loaded, toggleRead, setCard, recordQuiz, toggleBookmark, isBookmarked, resetAll, markAnswer],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
