/**
 * Lightweight, dependency-free quiz renderer.
 *
 * Usage on a lesson page:
 *   <div class="quiz" id="quiz" data-lesson-id="lesson-01"></div>
 *   <script type="application/json" id="quiz-data">
 *     [
 *       {
 *         "question": "What does YAML stand for?",
 *         "options": ["Yet Another Markup Language", "YAML Ain't Markup Language", "Your Application Meta Language"],
 *         "correctIndex": 1,
 *         "explain": "It's a recursive acronym: YAML Ain't Markup Language."
 *       }
 *     ]
 *   </script>
 *   <script src="../assets/js/quiz.js"></script>
 *
 * Progress (pass/fail per lesson) is stored in localStorage so the course
 * index page can show completion status. Nothing is sent anywhere.
 */
(function () {
  "use strict";

  const PASS_THRESHOLD = 0.8; // 80% correct to "pass" a lesson quiz

  function loadQuizData() {
    const dataEl = document.getElementById("quiz-data");
    if (!dataEl) return null;
    try {
      return JSON.parse(dataEl.textContent);
    } catch (e) {
      console.error("quiz.js: could not parse #quiz-data JSON", e);
      return null;
    }
  }

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem("course-progress") || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveProgress(lessonId, result) {
    try {
      const progress = getProgress();
      progress[lessonId] = result; // { score, total, passed, completedAt }
      localStorage.setItem("course-progress", JSON.stringify(progress));
    } catch (e) {
      // localStorage unavailable (private browsing etc.) — fail silently
    }
  }

  function renderQuiz(container, questions, lessonId) {
    container.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = "Check your understanding";
    container.appendChild(heading);

    const form = document.createElement("form");
    form.className = "quiz-form";
    form.setAttribute("novalidate", "true");

    questions.forEach((q, qIndex) => {
      const qWrap = document.createElement("div");
      qWrap.className = "quiz-question";
      qWrap.dataset.qindex = qIndex;

      const qText = document.createElement("p");
      qText.className = "q-text";
      qText.textContent = `${qIndex + 1}. ${q.question}`;
      qWrap.appendChild(qText);

      const optsWrap = document.createElement("div");
      optsWrap.className = "quiz-options";

      q.options.forEach((optText, optIndex) => {
        const label = document.createElement("label");
        label.className = "quiz-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q${qIndex}`;
        input.value = optIndex;
        input.required = true;

        const span = document.createElement("span");
        span.textContent = optText;

        label.appendChild(input);
        label.appendChild(span);
        optsWrap.appendChild(label);
      });

      qWrap.appendChild(optsWrap);

      const explain = document.createElement("p");
      explain.className = "explain";
      explain.textContent = q.explain || "";
      qWrap.appendChild(explain);

      form.appendChild(qWrap);
    });

    const actions = document.createElement("div");
    actions.className = "quiz-actions";

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "quiz-submit";
    submitBtn.textContent = "Submit answers";

    const result = document.createElement("span");
    result.className = "quiz-result";

    actions.appendChild(submitBtn);
    actions.appendChild(result);
    form.appendChild(actions);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let correctCount = 0;
      questions.forEach((q, qIndex) => {
        const qWrap = form.querySelector(`.quiz-question[data-qindex="${qIndex}"]`);
        const selected = form.querySelector(`input[name="q${qIndex}"]:checked`);
        const options = qWrap.querySelectorAll(".quiz-option");
        const explainEl = qWrap.querySelector(".explain");

        options.forEach((optLabel, optIndex) => {
          optLabel.classList.add("disabled");
          if (optIndex === q.correctIndex) {
            optLabel.classList.add("correct");
          } else if (selected && parseInt(selected.value, 10) === optIndex) {
            optLabel.classList.add("incorrect");
          }
        });

        if (selected && parseInt(selected.value, 10) === q.correctIndex) {
          correctCount++;
        }
        if (explainEl.textContent) explainEl.classList.add("show");
      });

      const total = questions.length;
      const passed = correctCount / total >= PASS_THRESHOLD;
      result.textContent = `${correctCount} / ${total} correct — ${passed ? "passed" : "try again"}`;
      result.className = "quiz-result " + (passed ? "pass" : "fail");

      submitBtn.disabled = true;

      saveProgress(lessonId, {
        score: correctCount,
        total: total,
        passed: passed,
        completedAt: new Date().toISOString(),
      });
    });

    container.appendChild(form);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("quiz");
    if (!container) return;

    const questions = loadQuizData();
    if (!questions || !questions.length) {
      container.innerHTML = "<p>No quiz questions found for this lesson.</p>";
      return;
    }

    const lessonId = container.dataset.lessonId || "lesson";
    renderQuiz(container, questions, lessonId);
  });
})();
