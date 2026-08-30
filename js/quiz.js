/* ============================================================
   Quiz component
   Drop <div class="quiz-slot" data-quiz="classification"></div>
   anywhere in guide.html and the matching quiz from
   BTO_DATA.quizzes renders into it.
   ============================================================ */

document.querySelectorAll(".quiz-slot").forEach(slot => {
  const key = slot.dataset.quiz;
  const q = BTO_DATA.quizzes[key];
  if(!q) return;

  slot.innerHTML = `
    <div class="quiz">
      <div class="quiz-label">Quick check</div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-opts">
        ${q.options.map((o, i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join("")}
      </div>
      <div class="quiz-fb"></div>
    </div>`;

  const opts = slot.querySelectorAll(".quiz-opt");
  const fb   = slot.querySelector(".quiz-fb");

  opts.forEach(btn => btn.addEventListener("click", () => {
    const chosen  = +btn.dataset.i;
    const correct = chosen === q.answer;

    opts.forEach((b, i) => {
      b.disabled = true;
      if(i === q.answer) b.classList.add("right");
      else if(i === chosen) b.classList.add("wrong");
    });

    fb.className = "quiz-fb show " + (correct ? "right" : "wrong");
    fb.innerHTML = `<b>${correct ? "That's right. " : "Not quite. "}</b>${q.why}`;
  }));
});
