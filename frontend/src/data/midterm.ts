import raw from "./midterm.json";
import type { Question } from "./types";

type RawMid = { section: string; q: string; options: string[]; answer: number; explanations: string[] };

// Personal review quiz from "Midterm quiz 1.pdf" — kept separate from the textbook chapters.
export const midtermQuestions: (Question & { section: string })[] = (raw as RawMid[]).map((m, i) => ({
  id: `midterm-${i + 1}`,
  topicId: "midterm",
  section: m.section,
  q: m.q,
  options: m.options,
  answer: m.answer,
  explanation: m.explanations[m.answer],
  optionExplanations: m.explanations,
}));

export const midtermSections = Array.from(new Set(midtermQuestions.map((q) => q.section)));
