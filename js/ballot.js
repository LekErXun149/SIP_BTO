/* ============================================================
   Ballot simulator

   Deliberately does NOT store "the" application rate. Rates change
   every launch, so the user reads a live figure off the HDB Flat
   Portal and types it in. That keeps this accurate with no upkeep.

   The output is a band and a rough ratio, never a precise percentage —
   the application rate alone can't give one, because priority scheme
   quotas and ballot chances also affect the draw.
   ============================================================ */

const B = BTO_DATA.ballot;

let bState = Object.assign(
  { rate: 3.0, type: "ft-family", tried: 0 },
  PROGRESS.get("ballot") || {}
);

/* ---------- build the applicant type buttons ---------- */
document.getElementById("bTypes").innerHTML = B.applicantTypes.map(t =>
  `<button class="${t.id === bState.type ? "on" : ""}" data-type="${t.id}">${t.label}</button>`
).join("");

/* ---------- build the demo buttons ---------- */
document.getElementById("bExamples").innerHTML = B.examples.map((ex, i) =>
  `<button class="ex-btn" data-ex="${i}">
     <span class="ex-name">${ex.name}</span>
     <span class="ex-rate mono">${ex.rate}×</span>
   </button>`
).join("");

function typeById(id){ return B.applicantTypes.find(t => t.id === id) || B.applicantTypes[0]; }
function bandFor(rate){ return B.bands.find(b => rate <= b.max); }

function renderBallot(){
  const t    = typeById(bState.type);
  const rate = Math.max(0.1, bState.rate);
  const band = bandFor(rate);

  /* headline band */
  const card = document.getElementById("bResult");
  card.className = "verdict " + (band.tone === "ok" ? "ok" : band.tone === "warn" ? "no" : "");
  document.getElementById("bBand").textContent = band.label;
  document.getElementById("bMeaning").textContent = band.meaning;

  const pill = document.getElementById("bPill");
  pill.textContent = rate.toFixed(1) + "× SUBSCRIBED";
  pill.className = "pill " + (band.tone === "ok" ? "ok" : "no");

  /* rough ratio — stated as "roughly", never a decimal percentage */
  const ratioEl = document.getElementById("bRatio");
  if(rate <= 1){
    ratioEl.textContent = "About 1 in 1";
    document.getElementById("bRatioSub").textContent =
      "There were more units than applicants in this category.";
  }else{
    ratioEl.textContent = "About 1 in " + (rate < 10 ? rate.toFixed(1) : Math.round(rate));
    document.getElementById("bRatioSub").textContent =
      "applicants in this category can be offered a flat this exercise.";
  }

  /* ballot chances */
  document.getElementById("bChances").textContent = t.chances + (t.chances === 1 ? " chance" : " chances");
  document.getElementById("bChancesSub").textContent = t.note;

  /* rough number of attempts — a range, clearly hedged, and capped
     because "~23–36 tries" is technically derived but useless advice */
  const attemptsEl = document.getElementById("bAttempts");
  const attemptsSub = document.getElementById("bAttemptsSub");
  if(rate <= 1){
    attemptsEl.textContent = "Likely first try";
    attemptsSub.textContent = "At this rate most applicants are offered a flat straight away.";
  }else{
    const rough = rate / t.chances;
    if(rough > 8){
      attemptsEl.textContent = "Many tries";
      attemptsSub.textContent =
        "At this rate the wait could run to years. A less subscribed project, or the resale market, is worth weighing up.";
    }else{
      const lo = Math.max(1, Math.floor(rough));
      const hi = Math.ceil(rough * 1.5);
      const word = n => n === 1 ? "try" : "tries";
      attemptsEl.textContent = lo === hi ? `~${lo} ${word(lo)}` : `~${lo}–${hi} tries`;
      attemptsSub.textContent =
        "a very rough sense of how many exercises this might take. Real outcomes vary widely.";
    }
  }

  /* the honest caveat, tailored */
  const caveat = document.getElementById("bCaveat");
  caveat.innerHTML = bState.type === "second"
    ? "Second-timers compete for a much smaller reserved share of each project — HDB sets aside the bulk of supply for first-timers. Rates like these are normal, and the resale market has no ballot at all."
    : "This uses the application rate alone. If you qualify for a priority scheme — living near parents, having children — HDB reserves a slice of units for that group, and your real odds are better than the figure above suggests.";

  PROGRESS.set("ballot", Object.assign({}, bState));
}

/* ---------- inputs ---------- */
const rateInput = document.getElementById("bRate");
rateInput.value = bState.rate;
rateInput.addEventListener("input", () => {
  const v = parseFloat(rateInput.value);
  if(!isNaN(v) && v > 0){
    bState.rate = v;
    clearExampleHighlight();
    renderBallot();
  }
});

document.getElementById("bTypes").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  [...e.currentTarget.children].forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  bState.type = b.dataset.type;
  renderBallot();
});

/* ---------- demo examples ---------- */
function clearExampleHighlight(){
  document.querySelectorAll(".ex-btn").forEach(b => b.classList.remove("on"));
  document.getElementById("bExampleNote").className = "ex-note";
}

document.getElementById("bExamples").addEventListener("click", e => {
  const b = e.target.closest(".ex-btn"); if(!b) return;
  const ex = B.examples[+b.dataset.ex];

  clearExampleHighlight();
  b.classList.add("on");

  bState.rate = ex.rate;
  bState.type = ex.type;
  rateInput.value = ex.rate;
  [...document.getElementById("bTypes").children].forEach(x =>
    x.classList.toggle("on", x.dataset.type === ex.type));

  const note = document.getElementById("bExampleNote");
  note.className = "ex-note show";
  note.innerHTML = `<b>${ex.name}</b> — ${ex.blurb}
    <span class="ex-src">Figures from the ${B.examplesLaunch}. Live rates will differ.</span>`;

  renderBallot();
  document.getElementById("bResult").scrollIntoView({ behavior:"smooth", block:"center" });
});

/* ---------- portal link ---------- */
document.querySelectorAll(".portal-link").forEach(a => {
  a.href = B.portalUrl;
  if(!a.textContent.trim()) a.textContent = B.portalLabel;
});

renderBallot();
