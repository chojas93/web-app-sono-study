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

## Backlog
- P1: Spaced repetition (show learning cards sooner), timed exam mode mixing all topics
- P1: Search across notes
- P2: Remaining chapters (kidneys, spleen, OB/GYN), images from the slides, export/import of progress file
