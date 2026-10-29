import { topics } from "./index";
import { media } from "./media";
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
const quizzable = (t: string) => (media[t]?.sectionImages ?? []).filter((x) => !EXCLUDE.has(x.key));
const allCaptions = Array.from(new Set(Object.keys(media).flatMap((t) => quizzable(t).map((x) => x.caption))));

// "What does this image show?" questions made from the slide images.
export function imageQuestions(topicIds: string[]): Question[] {
  return topicIds.flatMap((t) =>
    quizzable(t).map((img) => {
      const distractors = shuffle(allCaptions.filter((c) => c !== img.caption)).slice(0, 3);
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

export type QuizConfig = { topicIds: string[]; count: number; mode: "mixed" | "image" };

export function buildQuiz({ topicIds, count, mode }: QuizConfig): Question[] {
  const pool =
    mode === "image" ? imageQuestions(topicIds) : topics.filter((t) => topicIds.includes(t.id)).flatMap((t) => t.quiz);
  return shuffle(pool).slice(0, count);
}

export const imageQuizCount = (t: string) => quizzable(t).length;

export function poolSize(topicIds: string[], mode: "mixed" | "image") {
  return mode === "image"
    ? topicIds.reduce((n, t) => n + quizzable(t).length, 0)
    : topics.filter((t) => topicIds.includes(t.id)).reduce((n, t) => n + t.quiz.length, 0);
}
