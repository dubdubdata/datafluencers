# Course site structure

A plain HTML/CSS/JS structure for hosting a course on GitHub Pages, with
embedded YouTube videos and self-marking quizzes. No build step, no
framework — copy, edit, push.

## Layout

```
index.html              Course home page — lists modules and lessons
lessons/
  lesson-01.html         One page per lesson (video + notes + quiz)
  lesson-02.html
assets/
  css/style.css           Shared styling (light/dark aware)
  js/quiz.js              Renders quizzes from embedded JSON, marks them,
                           saves pass/fail to the learner's browser
```

## Adding a lesson

1. Copy `lessons/lesson-02.html` to `lessons/lesson-03.html` (or whatever's next).
2. Swap `VIDEO_ID` in the iframe `src` for your YouTube video id (the part
   after `v=` in a normal YouTube URL). Unlisted videos work fine and won't
   show up in YouTube search — that's usually the right setting for a paid
   course you're now hosting for free/gated elsewhere.
3. Update the title, breadcrumb, heading, and notes section.
4. Edit the `#quiz-data` JSON block: one object per question, `options` is
   an array of answer strings, `correctIndex` is the zero-based index of the
   right answer, `explain` (optional) shows after submission.
5. Fix the `data-lesson-id` on the `<div id="quiz">` to something unique
   (e.g. `lesson-03`) — this is the key used to track completion.
6. Fix the prev/next links at the bottom of the page.
7. Add a matching `<li data-lesson-id="lesson-03">` entry to `index.html`
   so it shows up on the course home page with a completion status.

## How the quiz works

Each lesson embeds its questions as JSON in a `<script type="application/json"
id="quiz-data">` block. `assets/js/quiz.js` reads that, renders radio-button
questions, and on submit marks each answer correct/incorrect inline with an
optional explanation. A learner needs 80% correct to "pass" — change
`PASS_THRESHOLD` in `quiz.js` to adjust.

Results are saved to the browser's `localStorage` under the key
`course-progress`, and the course home page (`index.html`) reads that to
show "Completed" / "Attempted" / "Not started" next to each lesson. This is
**per-browser, client-side only** — nothing is sent to a server, so:

- It's free and needs no backend.
- It resets if the learner clears site data or switches browsers/devices.
- You have no way to see who's actually completed what.

If you need real progress tracking (e.g. for certificates, or to gate
content until a quiz is passed), you'd need to add a small backend or a
service like Supabase/Firebase to store results server-side, or embed a
third-party quiz tool (Google Forms, Typeform) instead of this local one.
That's a bigger step — happy to help design that if/when you need it.

## Publishing with GitHub Pages

1. Push this structure to your repo (root, or a `/docs` folder — either works).
2. In the repo: **Settings → Pages → Build and deployment → Source**, choose
   "Deploy from a branch", pick `main` and `/` (root) or `/docs`.
3. Your course will be live at `https://<username>.github.io/<repo>/`.

## Gating access

Plain GitHub Pages is public — anyone with the URL can view it. If you were
relying on Kajabi to gate content behind payment, GitHub Pages alone won't
replace that. Options, roughly in order of effort:
- Make the GitHub repo private and give students access via GitHub itself
  (clunky, and GitHub Pages from a private repo needs GitHub Pro/Team/Enterprise).
- Keep the site public but keep video links unlisted, and treat the URL
  itself as the "access" (low security, zero effort).
- Put the static site behind a simple auth layer (Cloudflare Access,
  Netlify/Vercel password protection, or a lightweight paid-gate service).
- Keep using a paid platform just for checkout + gating, and host the
  *content* here.

## Video hosting note

Videos embed via `youtube-nocookie.com` (YouTube's privacy-enhanced embed
domain — no tracking cookies until the viewer interacts with the player).
If your course videos are currently private/paid content on YouTube, upload
them as **Unlisted** so the embed works but they don't show up in search or
on your channel.
