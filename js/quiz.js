/* ============================================================
   Quiz page

   Twenty questions across five rounds, one at a time. Answering
   reveals the reason for the option you picked AND the reason the
   correct one is correct — so a wrong answer explains your specific
   misconception, not just the right answer.

   Results save per question, so a partly-finished quiz survives a
   reload and the summary can show which rounds were weakest.
   ============================================================ */

const Q = BTO_DATA.quiz;

/* flatten the rounds into one ordered list, keeping round info on each */
const ALL = [];
Q.rounds.forEach((r, ri) => {
  r.questions.forEach((q, qi) => {
    ALL.push({ ...q, roundId: r.id, roundTitle: r.title, roundIndex: ri,
               page: r.page, key: `${r.id}-${qi}` });
  });
});

/* saved answers: { "money-1": 2, ... } — the index the user picked */
let answers = PROGRESS.get("quiz") || {};
let idx = firstUnanswered();
let revealed = false;

function firstUnanswered(){
  const i = ALL.findIndex(q => !(q.key in answers));
  return i === -1 ? 0 : i;
}
function answeredCount(){ return ALL.filter(q => q.key in answers).length; }
function correctCount(){ return ALL.filter(q => answers[q.key] === q.answer).length; }
function roundScore(roundId){
  const qs = ALL.filter(q => q.roundId === roundId);
  return {
    done:  qs.filter(q => q.key in answers).length,
    right: qs.filter(q => answers[q.key] === q.answer).length,
    total: qs.length
  };
}

/* ---------- header: progress, score, round pips ---------- */
function paintHeader(){
  const done = answeredCount(), right = correctCount();
  document.getElementById("qProgress").textContent = `${done} of ${ALL.length} answered`;
  document.getElementById("qScore").textContent = done ? `${right} correct` : "—";
  document.getElementById("qBarFill").style.width = (done / ALL.length * 100) + "%";

  document.getElementById("qRounds").innerHTML = Q.rounds.map((r, i) => {
    const s = roundScore(r.id);
    const state  = s.done === s.total ? "done" : s.done > 0 ? "part" : "";
    const active = ALL[idx] && ALL[idx].roundIndex === i ? " active" : "";
    return `<button class="round-pip ${state}${active}" data-round="${i}">
              <span class="pip-title">${r.title}</span>
              <span class="pip-score mono">${s.done ? s.right + "/" + s.total : s.total}</span>
            </button>`;
  }).join("");
}

/* ---------- one question ---------- */
function paintQuestion(){
  const card = document.getElementById("qCard");
  const q = ALL[idx];
  const picked = answers[q.key];
  const isAnswered = picked !== undefined;
  const showFeedback = isAnswered && revealed;

  card.innerHTML = `
    <div class="q-meta">
      <span class="q-round mono">${q.roundTitle}</span>
      <span class="q-count mono">Question ${idx + 1} of ${ALL.length}</span>
    </div>
    <h3 class="q-text">${q.q}</h3>
    <div class="q-opts">
      ${q.options.map((o, i) => {
        let cls = "quiz-opt";
        if(showFeedback){
          if(i === q.answer) cls += " right";
          else if(i === picked) cls += " wrong";
          else cls += " muted";
        }
        let mark = "";
        if(showFeedback && i === q.answer) mark = '<span class="opt-mark">✓</span>';
        else if(showFeedback && i === picked) mark = '<span class="opt-mark">✕</span>';
        return `<button class="${cls}" data-i="${i}"${showFeedback ? " disabled" : ""}>
                  <span class="opt-letter mono">${"ABCD"[i]}</span>
                  <span class="opt-text">${o.t}</span>${mark}
                </button>`;
      }).join("")}
    </div>
    <div class="q-feedback" id="qFeedback"></div>
    <div class="q-nav">
      <button class="btn btn-line" id="qPrev"${idx === 0 ? " disabled" : ""}>← Back</button>
      <button class="btn btn-dark" id="qNext"${!isAnswered ? " disabled" : ""}>
        ${idx === ALL.length - 1 ? "See results" : "Next →"}
      </button>
    </div>`;

  if(showFeedback) paintFeedback(q, picked);

  card.querySelectorAll(".quiz-opt").forEach(b =>
    b.addEventListener("click", () => choose(+b.dataset.i)));

  document.getElementById("qPrev").onclick = () => {
    if(idx > 0){ idx--; revealed = answers[ALL[idx].key] !== undefined; paintAll(); }
  };
  document.getElementById("qNext").onclick = () => {
    if(idx === ALL.length - 1) showSummary();
    else { idx++; revealed = answers[ALL[idx].key] !== undefined; paintAll(); }
  };
}

/* the point of the whole feature: explain the choice AND the answer */
function paintFeedback(q, picked){
  const fb = document.getElementById("qFeedback");
  const right = picked === q.answer;
  fb.className = "q-feedback show " + (right ? "right" : "wrong");
  fb.innerHTML = right
    ? `<div class="fb-line right-line">
         <span class="fb-tag">Correct</span>
         <b>${q.options[q.answer].t}</b> ${q.options[q.answer].why}
       </div>`
    : `<div class="fb-line wrong-line">
         <span class="fb-tag">You chose</span>
         <b>${q.options[picked].t}</b> ${q.options[picked].why}
       </div>
       <div class="fb-line right-line">
         <span class="fb-tag">The answer</span>
         <b>${q.options[q.answer].t}</b> ${q.options[q.answer].why}
       </div>`;
}

function choose(i){
  const q = ALL[idx];
  if(answers[q.key] !== undefined) return;   // first answer stands
  answers[q.key] = i;
  revealed = true;
  PROGRESS.set("quiz", Object.assign({}, answers));
  paintAll();
}

/* ---------- summary ---------- */
function showSummary(){
  const right = correctCount(), done = answeredCount();
  const pct = Math.round(right / ALL.length * 100);
  let verdict;
  if(pct >= 85)      verdict = "You know this inside out.";
  else if(pct >= 60) verdict = "A solid grasp, with a few gaps.";
  else if(pct >= 35) verdict = "The basics are landing. Worth another read.";
  else               verdict = "Plenty still to pick up — that's what the guide is for.";

  const weakest = Q.rounds
    .map(r => ({ r, s: roundScore(r.id) }))
    .filter(x => x.s.done > 0 && x.s.right < x.s.total)
    .sort((a, b) => (a.s.right / a.s.total) - (b.s.right / b.s.total));

  document.getElementById("qCard").innerHTML = `
    <div class="summary">
      <div class="sum-score mono">${right}<span>/${ALL.length}</span></div>
      <h3>${verdict}</h3>
      ${done < ALL.length
        ? `<p class="sum-note">You've answered ${done} of ${ALL.length} so far.</p>` : ""}

      <div class="sum-rounds">
        ${Q.rounds.map(r => {
          const s = roundScore(r.id);
          const w = s.total ? (s.right / s.total * 100) : 0;
          return `<div class="sum-round">
            <div class="sum-round-top"><span>${r.title}</span><span class="mono">${s.right}/${s.total}</span></div>
            <div class="sum-bar"><div class="sum-bar-fill" style="width:${w}%"></div></div>
          </div>`;
        }).join("")}
      </div>

      ${weakest.length ? `
        <div class="tip" style="text-align:left; margin-top:20px">
          <b>Worth a revisit · </b>${weakest.slice(0, 2).map(x =>
            `<a href="${x.r.page}">${x.r.title}</a>`).join(" and ")} —
          the pages behind those rounds cover what tripped you up.
        </div>` : ""}

      <div class="q-nav" style="justify-content:center">
        <button class="btn btn-line" id="qReview">Review answers</button>
        <button class="btn btn-amber" id="qRetry">Start over</button>
      </div>
    </div>`;

  document.getElementById("qReview").onclick = () => { idx = 0; revealed = true; paintAll(); };
  document.getElementById("qRetry").onclick = () => {
    if(!confirm("Clear your answers and start the quiz again?")) return;
    answers = {};
    PROGRESS.set("quiz", {});
    idx = 0; revealed = false;
    paintAll();
  };
  paintHeader();
}

function paintAll(){ paintHeader(); paintQuestion(); }

/* jump between rounds */
document.getElementById("qRounds").addEventListener("click", e => {
  const b = e.target.closest(".round-pip"); if(!b) return;
  idx = ALL.findIndex(q => q.roundIndex === +b.dataset.round);
  revealed = answers[ALL[idx].key] !== undefined;
  paintAll();
});

/* everything already answered? open on the summary */
if(answeredCount() === ALL.length){ paintHeader(); showSummary(); }
else { revealed = answers[ALL[idx].key] !== undefined; paintAll(); }
