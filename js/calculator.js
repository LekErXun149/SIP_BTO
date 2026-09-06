/* ============================================================
   Affordability calculator
   All policy numbers come from data/bto-data.js — none are
   hard-coded here.
   ============================================================ */

const R = BTO_DATA.rules;
const sgd = n => "$" + Math.round(n).toLocaleString("en-SG");

const DEFAULT_STATE = {
  type: "family",
  income: 8000,
  savings: 80000,
  price: 450000,
  rate: R.hdbLoanRate,
  stressRate: R.hdbStressRate,
  tenure: 25,
  debts: 0
};

/* start from saved progress if there is any */
let state = Object.assign({}, DEFAULT_STATE, PROGRESS.get("calculator") || {});

/* Each control is a slider paired with a number box. They stay in sync:
   drag the slider and the box follows, type in the box and the slider follows. */
const CONTROLS = [
  { key:"income",  slider:"income",  num:"incomeNum"  },
  { key:"savings", slider:"savings", num:"savingsNum" },
  { key:"price",   slider:"price",   num:"priceNum"   },
  { key:"debts",   slider:"debts",   num:"debtsNum"   },
  { key:"tenure",  slider:"tenure",  num:"tenureNum"  }
];

function clamp(el, v){
  const mn = parseFloat(el.min), mx = parseFloat(el.max);
  if(!isNaN(mn) && v < mn) return mn;
  if(!isNaN(mx) && v > mx) return mx;
  return v;
}

function restoreControls(){
  CONTROLS.forEach(c => {
    const s = document.getElementById(c.slider);
    const n = document.getElementById(c.num);
    if(s) s.value = state[c.key];
    if(n) n.value = state[c.key];
  });

  [...document.getElementById("segType").children].forEach(b =>
    b.classList.toggle("on", b.dataset.type === state.type));
  [...document.getElementById("segLoan").children].forEach(b =>
    b.classList.toggle("on", +b.dataset.rate === state.rate));

  document.getElementById("typeHint").textContent = state.type === "family"
    ? `Family BTO income ceiling: ${sgd(R.incomeCeilingFamily)} a month.`
    : `Singles aged 35+ can buy a 2-room Flexi; ceiling ${sgd(R.incomeCeilingSingle)} a month.`;
}

/* Enhanced CPF Housing Grant — ESTIMATE ONLY.
   HDB publishes the maximum ($120,000 families / $60,000 singles) and the
   income ceiling ($9,000 / $4,500), but not the full band table, so this
   tapers evenly across $500 income bands from the maximum down to a $5,000
   floor at the ceiling. Treat it as a ballpark; the real figure comes from
   your HFE letter. Source: BTO_DATA.sources.grants */
function ehg(income, isFamily){
  const ceiling = isFamily ? R.ehgCeilingFamily : R.ehgCeilingSingle;
  if(income > ceiling) return 0;

  const maxGrant = isFamily ? R.ehgMaxFamily : R.ehgMaxSingle;
  const floor    = isFamily ? 5000 : 2500;    // smallest band
  const baseBand = isFamily ? 1500 : 750;     // full grant at or below this
  const bandSize = isFamily ? 500  : 250;

  if(income <= baseBand) return maxGrant;

  const totalBands = Math.ceil((ceiling - baseBand) / bandSize);
  const bandsAbove = Math.ceil((income - baseBand) / bandSize);
  const step = (maxGrant - floor) / totalBands;

  /* round to the nearest $1,000 so it reads like a grant, not a calculation */
  return Math.max(floor, Math.round((maxGrant - bandsAbove * step) / 1000) * 1000);
}

function monthlyRepay(loan, annualRatePct, years){
  const r = annualRatePct / 100 / 12, n = years * 12;
  if(r === 0) return loan / n;
  return loan * r / (1 - Math.pow(1 + r, -n));
}

function render(){
  const isFamily = state.type === "family";
  const ceiling  = isFamily ? R.incomeCeilingFamily : R.incomeCeilingSingle;
  const eligible = state.income <= ceiling;

  /* verdict */
  const v = document.getElementById("verdict");
  v.classList.toggle("ok", eligible);
  v.classList.toggle("no", !eligible);
  document.getElementById("verdictTitle").textContent =
    eligible ? "Within the income ceiling" : "Over the income ceiling";
  const pill = document.getElementById("verdictPill");
  pill.textContent = eligible ? "ELIGIBLE" : "OVER CEILING";
  pill.className = "pill " + (eligible ? "ok" : "no");
  document.getElementById("verdictText").textContent = eligible
    ? `A ${isFamily ? "family" : "single applicant aged 35+"} can apply with income up to ${sgd(ceiling)} a month. You're at ${sgd(state.income)}.`
    : `The ${isFamily ? "family BTO" : "single 2-room Flexi"} ceiling is ${sgd(ceiling)} a month — you're ${sgd(state.income - ceiling)} above it. Resale flats have no income ceiling.`;

  /* grant */
  document.getElementById("rGrant").textContent = sgd(ehg(state.income, isFamily));

  /* loan and downpayment */
  const loan = state.price * R.ltv;
  const down = state.price * (1 - R.ltv);
  document.getElementById("rLoan").textContent = sgd(loan);
  document.getElementById("rDown").textContent = sgd(down);
  document.getElementById("rDownSub").textContent =
    state.savings >= down ? "covered by your savings ✓" : "short by " + sgd(down - state.savings);

  /* Monthly repayment — at the rate you actually pay. */
  const m = monthlyRepay(loan, state.rate, state.tenure);
  document.getElementById("rMonthly").textContent = sgd(m);
  document.getElementById("rMonthlySub").textContent = `over ${state.tenure} yrs at ${state.rate}%`;

  /* Eligibility repayment — at the stress-test floor. This is the figure
     HDB (or the bank) uses to decide how much you may borrow, so it is the
     one that must pass MSR and TDSR. It is always the higher of the two. */
  const stressRate = state.rate === R.hdbLoanRate ? R.hdbStressRate : R.bankStressRate;
  const mStress = monthlyRepay(loan, Math.max(stressRate, state.rate), state.tenure);
  document.getElementById("rStress").textContent = sgd(mStress);
  document.getElementById("rStressSub").textContent =
    `what ${state.rate === R.hdbLoanRate ? "HDB" : "the bank"} tests you against, at ${Math.max(stressRate, state.rate)}%`;

  /* MSR — assessed on the stressed repayment, not the actual one */
  const msrPct = (mStress / state.income) * 100;
  const rMsr = document.getElementById("rMsr");
  rMsr.textContent = msrPct.toFixed(1) + "%";
  const withinMsr = msrPct <= R.msrCap;
  rMsr.className = "v mono " + (withinMsr ? "ok" : "warn");
  const fill = document.getElementById("msrFill");
  fill.style.width = Math.min(100, msrPct / R.msrCap * 100) + "%";
  fill.style.background = withinMsr ? "var(--ok)" : "var(--warn)";
  document.getElementById("rMsrSub").textContent = withinMsr
    ? `Within the ${R.msrCap}% cap, tested at ${Math.max(stressRate, state.rate)}%.`
    : `Over the ${R.msrCap}% cap — lower the price, lengthen the tenure, or raise income.`;

  /* TDSR — also assessed on the stressed repayment, plus other debts */
  const tdsrPct = ((mStress + state.debts) / state.income) * 100;
  const rTdsr = document.getElementById("rTdsr");
  const withinTdsr = tdsrPct <= R.tdsrCap;
  rTdsr.textContent = tdsrPct.toFixed(1) + "%";
  rTdsr.className = "v mono " + (withinTdsr ? "ok" : "warn");
  document.getElementById("rTdsrSub").textContent = withinTdsr
    ? `Within the ${R.tdsrCap}% cap including your other debts.`
    : `Over the ${R.tdsrCap}% cap — other debts are pushing you past the limit.`;

  /* upfront cost breakdown */
  document.getElementById("rStamp").textContent = sgd(stampDuty(state.price));
  document.getElementById("rUpfront").textContent = sgd(down + stampDuty(state.price));

  /* remember these settings for next time */
  PROGRESS.set("calculator", Object.assign({}, state));
}

/* Buyer's Stamp Duty — standard residential tiers */
function stampDuty(price){
  let d = 0;
  const tiers = [[180000,.01],[180000,.02],[640000,.03],[500000,.04],[1500000,.05]];
  let left = price;
  for(const [band, rate] of tiers){
    if(left <= 0) break;
    const amt = Math.min(left, band);
    d += amt * rate;
    left -= amt;
  }
  if(left > 0) d += left * .06;
  return d;
}

/* ---------- wire up the inputs ---------- */
function bind(id, key, targetId, fmt){
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener("input", () => {
    state[key] = +el.value;
    if(targetId) document.getElementById(targetId).textContent = fmt(+el.value);
    restoreControls();
render();
  });
}
bind("income",  "income",  "incVal",   v => sgd(v));
bind("savings", "savings", "savVal",   v => sgd(v));
bind("price",   "price",   "priceVal", v => sgd(v));
bind("tenure",  "tenure",  "tenVal",   v => v + " years");
bind("debts",   "debts",   "debtVal",  v => sgd(v));

document.getElementById("segType").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  [...e.currentTarget.children].forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  state.type = b.dataset.type;
  const fam = state.type === "family";
  document.getElementById("typeHint").textContent = fam
    ? `Family BTO income ceiling: ${sgd(R.incomeCeilingFamily)} a month.`
    : `Singles aged 35+ can buy a 2-room Flexi; ceiling ${sgd(R.incomeCeilingSingle)} a month.`;
  document.getElementById("income").max = fam ? 16000 : 9000;
  render();
});

document.getElementById("segLoan").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  [...e.currentTarget.children].forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  state.rate = +b.dataset.rate;
  state.stressRate = b.dataset.stress ? +b.dataset.stress : R.hdbStressRate;
  document.getElementById("loanHint").innerHTML = state.rate === R.hdbLoanRate
    ? `You pay ${R.hdbLoanRate}% on an HDB loan. Separately, HDB checks how much you may borrow using a ${R.hdbStressRate}% stress rate — both are shown below.`
    : `Bank rates vary; ${R.bankLoanRate}% is illustrative. MAS requires banks to assess you against a stricter ${R.bankStressRate}% floor.`;
  render();
});

/* put any saved values back into the controls, then draw */
restoreControls();
render();
