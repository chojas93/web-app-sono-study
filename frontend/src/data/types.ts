export type TopicColorKey = "topicOverview" | "topicLiver" | "topicGallbladder" | "topicPancreas" | "topicGITract";

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

export type Section = { id: string; topicId: string; title: string; points: string[] };
export type Flashcard = { id: string; topicId: string; front: string; back: string };
export type Question = { id: string; topicId: string; q: string; options: string[]; answer: number; explanation: string };
export type Mnemonic = { id: string; topicId: string; title: string; device: string; meaning: string };

export type Topic = Omit<RawTopic, "sections" | "flashcards" | "quiz" | "mnemonics"> & {
  sections: Section[];
  flashcards: Flashcard[];
  quiz: Question[];
  mnemonics: Mnemonic[];
};
