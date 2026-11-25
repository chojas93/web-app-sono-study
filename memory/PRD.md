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

## Update (Jun 2026): Neck images, all 30 textbook questions, weak spots
- 11 Neck ultrasound images added to the notes, plus an image quiz and image flashcards
- All 30 textbook review questions per chapter (420 total); ~32 rebuilt by hand where the PDF columns broke apart (some are 2-option true/false). Each topic has a Textbook review button (mode=book)
- Weak spot review: wrong answers are stored in progress.missed until answered correctly; buttons on Home (all chapters) and on each topic
- Image-quiz wrong options come from the same chapter first
- Testing iteration 4 passed; the small issues it raised were fixed

## Update (Jun 2026): Textbook answer explanations
- All 420 textbook questions now have a 1–2 sentence explanation (src/data/bookExplanations.json), written once by AI with /app/scripts/gen_explanations.py and bundled in the app; the app makes no AI calls when used

## Update (Jun 2026): Switched to the 3rd edition textbook
- First-edition questions replaced by 3rd edition (Examination Review for Ultrasound, 9781975185480) review questions: 60 per chapter for Ch 1–14 (840 total), keys from the book's answer section; 86 figure questions include the textbook figure (assets/slides/b3_*)
- New AI explanations for all 840 (/app/scripts/gen_explanations.py → bookExplanations.json)
- Every study section rewritten in more detail from the 3rd edition chapter text (/app/scripts/gen_detailed_notes.py → detailedNotes.json, overrides section points by title); about 2,500 bullet points in total
- Content is written once and bundled in the app; no AI calls at runtime

## Update (Jun 2026): Midterm quiz, score trends, missing figures
- Added figures to Spleen Q54, Vasculature Q16 and Neck Q11; the "Figure 6- 16" spacing had broken the match
- Score trend bar chart (last 10 attempts) for each chapter on the Progress tab (src/components/score-trend.tsx); quiz history now keeps 300 entries
- Midterm Quiz 1 (personal review), separate from the chapters: /midterm screen with All plus 4 sections (Spleen, Pancreas, Gallbladder and Bile Duct, Liver), 102 questions. The PDF had no answer key, so answers and per-option explanations were written by AI (/app/scripts/gen_midterm.py → src/data/midterm.json); each choice shows why it is right or wrong after submitting

## Backlog
- OB/GYN chapters (waiting on PDFs from user)
- P1: Spaced repetition (show learning cards sooner), timed exam mode mixing all topics
- P1: Search across notes
- P2: Remaining chapters (kidneys, spleen, OB/GYN), images from the slides, export/import of progress file

## Update (Iteration 7)
- Midterm answer shuffle fix verified by testing agent (always-A scores ~20-25%).
- Progress score trends split per mode: Quiz / Image quiz / Textbook (testIDs score-trend-{id}-{mode}).
- Midterm missed-questions review (/quiz/midterm?topics=missed), kept separate from chapter weak spots; review lists rebuild once saved progress loads.
- Section images expansion: 794 figures extracted from slides + 3rd ed. textbook (scripts/extract_candidates.py), AI-classified (classify_candidates.py, gpt-5.4 vision), up to 3 per section picked (select_images.py, fill_empty_sections.py). Data: src/data/extraMedia.json + extraSlides.ts, merged in media.ts/slides.ts. Diagrams/labelled images have quiz:false (excluded from image quiz). 294 new section images, 97 new image flashcards.
- Label-the-diagram quiz: scripts/gen_label_quiz.py (RapidOCR + gpt-5.4 vision) masks every text label, numbers structure labels; data src/data/labelQuiz.json + labelSlides.ts (assets/labels). Mode "label" in quiz.ts, button open-label-quiz-button on topic page, trend "Diagram labels". Quiz images tap-to-enlarge (quiz-image-zoom-button).
- Missing pictures: remaining 9 sections (FAST, Ascariasis, Lung Masses, Peyronie, Penile Trauma, Prostatitis, Galactocele, Melanoma, Jaundice, WBC) have NO pictures in the source PDFs (slides are text-only); Adrenal Rests got 1.
- Image quiz choices: captions tagged with a canonical diagnosis (scripts/gen_caption_groups.py -> src/data/captionGroups.json, 193 captions / 165 groups); quiz.ts similar() rejects same-group choices. Verified 0 same-diagnosis pairs across 5550 generated questions.
- Read aloud (notes only): expo-speech on-device voice via src/hooks/read-aloud.ts; topic screen buttons read-all-notes-button and section-speak-{id}; stops on leaving the screen (useFocusEffect) or switching to Mnemonics tab. Not in quizzes/flashcards/midterm by user request.
