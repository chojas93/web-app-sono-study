# Sono Study — PRD

## Original problem statement
Build the same study guide app as "slide-study-1" from 5 PDFs (Abdominal Sonography Overview, Liver, Gallbladder, Pancreas, GI Tract) as an iOS app. All progress and anything saved stays on the user's own device, with no backend cloud.

## User choices
- Features: topic study notes, flashcards, multiple-choice quizzes, progress tracking, bookmarks, mnemonics
- Content written once and built into the app (works offline)
- No sign-in
- Style: dark-focused plus bright and friendly, with a dark mode button

## Architecture
- Expo Router app, frontend only. The backend is not used.
- Content: /app/frontend/src/data/*.ts (5 topics: 70 notes sections, 94 flashcards, 70 MCQs, 32 mnemonics)
- Local persistence: src/store/progress.tsx (AsyncStorage through @/src/utils/storage; localStorage on web). Theme preference is also saved locally.
- Screens: (tabs) Study / Saved / Progress; topic/[id]; flashcards/[id]; quiz/[id]
- iOS 26+ uses NativeTabs; other platforms use JS Tabs

## Implemented (Jun 2026)
- Home with overall mastery, day streak, 5 topic cards and a light/dark toggle
- Topic notes with mark-as-read and bookmarks; a mnemonics tab
- Flashcards: flip animation, known/still learning, filter modes, shuffle, bookmarks
- Quiz: shuffled questions and options, explanations, results, missed-question review, best score
- Saved tab with filters; Progress tab with stats, per-topic bars, quiz history and reset
- Testing iteration 1 passed. Fixes after testing: option shuffling, contrast, double-record guard, shuffle tally, mnemonic deep link

## Update (Jun 2026): New chapters + slide images
- Added Spleen (Ch 6), Urinary Tract (Ch 7), Adrenal Glands (Ch 8), Abdominal Vasculature (Ch 9), Noncardiac Chest & Retroperitoneum (Ch 11), each with notes, flashcards, quizzes and mnemonics
- 73 ultrasound images taken from all 10 PDFs and bundled in the app (assets/slides, src/data/slides.ts, src/data/media.ts)
- Images appear as thumbnails in note sections with a full-screen viewer; image flashcards (stable ids `${topic}-img-${key}`); images also show on saved flashcards
- Totals: 10 topics, 118 note sections, ~212 flashcards, 137 questions
- Testing iteration 2 passed

## Update (Jun 2026): Textbook questions, mock exam, image quiz, search
- Added Bile Ducts (Ch 4), Neck (Ch 12), Male Pelvis (Ch 13), MSK/Breast/Superficial (Ch 14); notes auto-extracted from slides (src/data/*Notes.ts), images added for some
- 388 textbook end-of-chapter review questions (Ch 1–14) parsed into src/data/bookQuestions.json and merged into each topic's quiz
- Topic quiz = 20 random questions; Image quiz per topic (src/data/quiz.ts); Mock exam builder (/mock) with chapter + count choice, saved per size (mock:N)
- Home: search bar ("Search") replaces the mastery/streak card; Mock exam card; Minimize toggle for topic cards; topic screens have Minimize all / per-section collapse
- Testing iteration 3 passed; issues it raised were fixed afterward

## Backlog
- OB/GYN chapters (waiting on PDFs from user)
- P1: Spaced repetition (show learning cards sooner), timed exam mode mixing all topics
- P1: Search across notes
- P2: Remaining chapters (kidneys, spleen, OB/GYN), images from the slides, export/import of progress file
