import type { SlideKey } from "./slides";

export type TopicColorKey =
  | "topicOverview"
  | "topicLiver"
  | "topicGallbladder"
  | "topicPancreas"
  | "topicGITract"
  | "topicSpleen"
  | "topicUrinary"
  | "topicAdrenal"
  | "topicVasculature"
  | "topicChest";

export type SlideImage = { key: SlideKey; caption: string };

export type RawTopic = {
  id: string;
  title: string;
  chapter: string;
  subtitle: string;
  icon: string;
  colorKey: TopicColorKey;
  sections: { title: string; points: string[] }[];
  flashcards: [string, string][];
  quiz: { q: string; options: string[]; answer: number; explanation: string }[];
  mnemonics: { title: string; device: string; meaning: string }[];
};

// Slide images per topic: attached to a section (by exact title) and/or turned into image flashcards.
export type TopicMedia = {
  sectionImages: { section: string; key: SlideKey; caption: string }[];
  imageCards: { key: SlideKey; front?: string; back: string }[];
};

export type Section = { id: string; topicId: string; title: string; points: string[]; images: SlideImage[] };
export type Flashcard = { id: string; topicId: string; front: string; back: string; image?: SlideKey };
export type Question = { id: string; topicId: string; q: string; options: string[]; answer: number; explanation: string };
export type Mnemonic = { id: string; topicId: string; title: string; device: string; meaning: string };

export type Topic = Omit<RawTopic, "sections" | "flashcards" | "quiz" | "mnemonics"> & {
  sections: Section[];
  flashcards: Flashcard[];
  quiz: Question[];
  mnemonics: Mnemonic[];
  imageCount: number;
};
