import captionGroups from "./captionGroups.json";
import { topics } from "./index";
import labelQuiz from "./labelQuiz.json";
import { media } from "./media";
import { midtermQuestions } from "./midterm";
import type { SlideKey } from "./slides";
import type { Question } from "./types";

export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Diagrams, vague views, or slides with the answer printed on them are not quizzable.
const EXCLUDE = new Set(["biliary_2", "biliary_3", "male_2", "pc_anatomy", "rt_psoas", "va_ivcthrombus", "ur_adpkd", "ur_dromedary"]);
const quizzable = (t: string) => (media[t]?.sectionImages ?? []).filter((x) => !EXCLUDE.has(x.key) && x.quiz !== false);
const allCaptions = Array.from(new Set(Object.keys(media).flatMap((t) => quizzable(t).map((x) => x.caption))));

// Choices that mean the same thing can't both be offered: same AI-tagged diagnosis (captionGroups.json, from
// scripts/gen_caption_groups.py), or nearly the same wording (e.g. "septation" vs "septations").
const groups = captionGroups as Record<string, string>;
const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length > 2).map((w) => w.replace(/s$/, "")));
function similar(a: string, b: string) {
  if (groups[a] && groups[a] === groups[b]) return true;
  const A = words(a);
  const B = words(b);
  const shared = [...A].filter((w) => B.has(w)).length;
  return shared / Math.max(1, Math.min(A.size, B.size)) >= 0.75;
}

// "What does this image show?" questions made from the slide images.
export function imageQuestions(topicIds: string[]): Question[] {
  return topicIds.flatMap((t) =>
    quizzable(t).map((img) => {
      const ok = (c: string) => !similar(c, img.caption);
      const same = shuffle(Array.from(new Set(quizzable(t).map((x) => x.caption))).filter(ok));
      const others = shuffle(allCaptions.filter((c) => ok(c) && !same.includes(c)));
      const distractors: string[] = [];
      for (const c of [...same, ...others]) if (distractors.length < 3 && distractors.every((d) => !similar(d, c))) distractors.push(c);
      return {
        id: `${t}-iq-${img.key}`,
        topicId: t,
        q: "Which finding or structure is shown in this image?",
        options: [img.caption, ...distractors],
        answer: 0,
        explanation: `This image shows: ${img.caption} (from the “${img.section}” notes).`,
        image: img.key,
      };
    }),
  );
}

// "Name the numbered structure" questions from labelled diagrams (labels covered by numbered badges).
type LabelDiagram = { topic: string; key: string; section: string; caption: string; labels: string[] };
const diagrams = labelQuiz as LabelDiagram[];

export function labelQuestions(topicIds: string[]): Question[] {
  return diagrams
    .filter((d) => topicIds.includes(d.topic))
    .flatMap((d) => {
      const topicPool = diagrams.filter((o) => o.topic === d.topic && o.key !== d.key).flatMap((o) => o.labels);
      return d.labels.map((name, i) => {
        const others: string[] = [];
        for (const c of [...shuffle(d.labels), ...shuffle(topicPool)])
          if (others.length < 3 && c !== name && !similar(c, name) && others.every((o) => !similar(o, c))) others.push(c);
        return {
          id: `${d.topic}-lb-${d.key}-${i + 1}`,
          topicId: d.topic,
          q: `Which structure is labelled ${i + 1}?`,
          options: [name, ...others],
          answer: 0,
          explanation: `Label ${i + 1} is the ${name} — from the diagram “${d.caption}” (${d.section}).`,
          image: d.key as SlideKey,
        };
      });
    });
}

export const labelQuizCount = (t: string) => diagrams.filter((d) => d.topic === t).reduce((n, d) => n + d.labels.length, 0);

export type QuizMode = "mixed" | "image" | "book" | "weak" | "midterm" | "label";
export type QuizConfig = { topicIds: string[]; count: number; mode: QuizMode; missed?: Record<string, boolean> };

function writtenPool(topicIds: string[]) {
  return topics.filter((t) => topicIds.includes(t.id)).flatMap((t) => t.quiz);
}

// Questions answered wrong before (written + image) for the chosen topics.
export function weakQuestions(topicIds: string[], missed: Record<string, boolean>) {
  return [...writtenPool(topicIds), ...imageQuestions(topicIds)].filter((q) => missed[q.id]);
}

// Midterm questions answered wrong before (kept separate from chapter weak spots).
export const midtermMissed = (missed: Record<string, boolean>) => midtermQuestions.filter((q) => missed[q.id]);

export function missedCount(topicIds: string[], missed: Record<string, boolean>) {
  return weakQuestions(topicIds, missed).length;
}

export function buildQuiz({ topicIds, count, mode, missed }: QuizConfig): Question[] {
  if (mode === "midterm") {
    const key = topicIds[0];
    if (key === "missed") return shuffle(midtermMissed(missed ?? {}));
    return midtermQuestions.filter((q) => key === "all" || q.section === key);
  }
  if (mode === "book") return writtenPool(topicIds).filter((q) => q.source === "textbook");
  if (mode === "label") return shuffle(labelQuestions(topicIds)).slice(0, count);
  const pool = mode === "image" ? imageQuestions(topicIds) : mode === "weak" ? weakQuestions(topicIds, missed ?? {}) : writtenPool(topicIds);
  return shuffle(pool).slice(0, count);
}

export const imageQuizCount = (t: string) => quizzable(t).length;

export function poolSize(topicIds: string[], mode: "mixed" | "image") {
  return mode === "image"
    ? topicIds.reduce((n, t) => n + quizzable(t).length, 0)
    : topics.filter((t) => topicIds.includes(t.id)).reduce((n, t) => n + t.quiz.length, 0);
}
