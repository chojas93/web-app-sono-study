import { adrenal } from "./adrenal";
import { biliary } from "./biliary";
import bookQuestions from "./bookQuestions.json";
import { chest } from "./chest";
import { gallbladder } from "./gallbladder";
import { gi } from "./gi";
import { liver } from "./liver";
import { male } from "./male";
import { media } from "./media";
import { msk } from "./msk";
import { neck } from "./neck";
import { overview } from "./overview";
import { pancreas } from "./pancreas";
import { spleen } from "./spleen";
import type { Flashcard, Mnemonic, RawTopic, Section, Topic } from "./types";
import { urinary } from "./urinary";
import { vasculature } from "./vasculature";

function build(raw: RawTopic): Topic {
  const t = raw.id;
  const m = media[t] ?? { sectionImages: [], imageCards: [] };
  const flashcards: Flashcard[] = raw.flashcards.map(([front, back], i) => ({ id: `${t}-c${i + 1}`, topicId: t, front, back }));
  m.imageCards.forEach((c) =>
    flashcards.push({
      id: `${t}-img-${c.key}`,
      topicId: t,
      front: c.front ?? "What finding is shown in this image?",
      back: c.back,
      image: c.key,
    }),
  );
  return {
    ...raw,
    sections: raw.sections.map((s, i) => ({
      id: `${t}-s${i + 1}`,
      topicId: t,
      ...s,
      images: m.sectionImages.filter((x) => x.section === s.title).map(({ key, caption }) => ({ key, caption })),
    })),
    flashcards,
    quiz: [
      ...raw.quiz.map((q, i) => ({ id: `${t}-q${i + 1}`, topicId: t, ...q, source: "guide" as const })),
      ...((bookQuestions as Record<string, { q: string; options: string[]; answer: number; n: number }[]>)[t] ?? []).map((q) => ({
        id: `${t}-b${q.n}`,
        topicId: t,
        q: q.q,
        options: q.options,
        answer: q.answer,
        explanation: `Textbook review question ${q.n} (${raw.chapter}) — answer from the book's answer key.`,
        source: "textbook" as const,
      })),
    ],
    mnemonics: raw.mnemonics.map((mn, i) => ({ id: `${t}-m${i + 1}`, topicId: t, ...mn })),
    imageCount: m.sectionImages.length,
  };
}

// Ordered by textbook chapter number.
export const topics: Topic[] = [overview, liver, gallbladder, biliary, pancreas, spleen, urinary, adrenal, vasculature, gi, chest, neck, male, msk].map(build);

export function getTopic(id: string | undefined) {
  return topics.find((t) => t.id === id);
}

export const sectionById: Record<string, Section> = {};
export const cardById: Record<string, Flashcard> = {};
export const mnemonicById: Record<string, Mnemonic> = {};
topics.forEach((t) => {
  t.sections.forEach((s) => (sectionById[s.id] = s));
  t.flashcards.forEach((c) => (cardById[c.id] = c));
  t.mnemonics.forEach((m) => (mnemonicById[m.id] = m));
});

export const totals = {
  sections: topics.reduce((n, t) => n + t.sections.length, 0),
  cards: topics.reduce((n, t) => n + t.flashcards.length, 0),
  questions: topics.reduce((n, t) => n + t.quiz.length, 0),
};
