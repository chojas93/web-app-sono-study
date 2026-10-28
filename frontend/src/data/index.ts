import { gallbladder } from "./gallbladder";
import { gi } from "./gi";
import { liver } from "./liver";
import { overview } from "./overview";
import { pancreas } from "./pancreas";
import type { Flashcard, Mnemonic, RawTopic, Section, Topic } from "./types";

function build(raw: RawTopic): Topic {
  const t = raw.id;
  return {
    ...raw,
    sections: raw.sections.map((s, i) => ({ id: `${t}-s${i + 1}`, topicId: t, ...s })),
    flashcards: raw.flashcards.map(([front, back], i) => ({ id: `${t}-c${i + 1}`, topicId: t, front, back })),
    quiz: raw.quiz.map((q, i) => ({ id: `${t}-q${i + 1}`, topicId: t, ...q })),
    mnemonics: raw.mnemonics.map((m, i) => ({ id: `${t}-m${i + 1}`, topicId: t, ...m })),
  };
}

export const topics: Topic[] = [overview, liver, gallbladder, pancreas, gi].map(build);

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
