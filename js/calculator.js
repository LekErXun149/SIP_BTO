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
  debts: 0,
  borrow: null,        // null = follow the sensible default
  borrowTouched: false // once the user sets it, stop auto-following
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
  { key:"tenure",  slider:"tenure",  num:"tenureNum"  },
  { key:"borrow",  slider:"borrow",  num:"borrowNum"  }
];

/* `state` is the single source of truth. The slider is only a view of it —
   it has a limited range, so it shows the value pinned to its own bounds
   while state keeps the real number. Writing to .value never fires an
   input event, so there is no feedback loop between the two controls. */
function clampToSlider(slider, v){
  const mn = parseFloat(slider.min), mx = parseFloat(slider.max);
  if(!isNaN(mn) && v < mn) return mn;
  if(!isNaN(mx) && v > mx) return mx;
  return v;
}

/* paint both controls from state, without triggering their handlers */
function syncControls(except){
  CONTROLS.filter(c => c.key !== "borrow").forEach(c => {
    const slider = document.getElementById(c.slider);
    const num    = document.getElementById(c.num);
    const v = state[c.key];
    if(slider && except !== c.slider) slider.value = clampToSlider(slider, v);
    if(num    && except !== c.num)    num.value = v;
    /* flag when the value sits outside the slider's reach */
    if(slider && num){
      const mx = parseFloat(slider.max);
      num.closest(".num-box")?.classList.toggle("beyond", !isNaN(mx) && v > mx);
    }
  });
}

function restoreControls(){
  syncControls();

  [...document.getElementById("segType").children].forEach(b =>
    b.classList.toggle("on", b.dataset.type === state.type));
  [...document.getElementById("segLoan").children].forEach(b =>
    b.classList.toggle("on", +b.dataset.rate === state.rate));

  document.getElementById("typeHint").textContent = state.type === "family"
    ? `Family BTO income ceiling: ${sgd(R.incomeCeilingFamily)} a month.`
    : `Singles aged 35+ can buy a 2-room Flexi; ceiling ${sgd(R.incomeCeilingSingle)} a month.`;
}

/* Enhanced CPF Housing Grant — a straight lookup against HDB's published
   bands, not an approximation. The bands don't step evenly (HDB drops
   $10,000 in some and $5,000 in others), so any formula would be wrong in
   most bands. Table choice depends on how the household is assessed:
     families        -> full household income, `full` table
     singles (35+)   -> the single's own income, `half` table
   Source: BTO_DATA.sources.grants */
function ehg(income, isFamily){
  const table = isFamily ? BTO_DATA.ehgTable.full : BTO_DATA.ehgTable.half;
  for(const [upperBound, amount] of table){
    if(income <= upperBound) return amount;
  }
  return 0;   // above the last band = above the EHG income ceiling
}

function syncBorrowControl(maxLoan, suggested, loan){
  const slider = document.getElementById("borrow");
  const num    = document.getElementById("borrowNum");
  if(!slider || !num) return;

  const cap = Math.round(maxLoan);
  slider.max = cap;
  num.max    = cap;

  if(document.activeElement !== num) num.value = Math.round(loan);
  slider.value = Math.round(loan);

  const hint = document.getElementById("borrowHint");
  if(loan === 0){
    hint.textContent = "Your savings cover the whole flat, so no loan is needed. Some buyers still borrow to keep cash free for renovation or emergencies.";
  }else if(loan >= cap - 0.5){
    hint.textContent = `The most HDB will lend on a ${sgd(state.price)} flat is ${sgd(cap)} (${R.ltv * 100}% loan-to-value). You're borrowing the maximum.`;
  }else if(state.savings >= state.price - loan){
    hint.textContent = `Your savings cover the rest. Borrowing less costs less interest; borrowing more keeps cash free.`;
  }else{
    hint.textContent = `You'd need ${sgd(state.price - loan)} upfront, which is ${sgd(state.price - loan - state.savings)} more than your savings.`;
  }
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

  /* The LTV limit is a CEILING on borrowing, not a requirement. If savings
     cover more than the minimum downpayment you may borrow less — or nothing
     at all. Some buyers still borrow the maximum on purpose, to keep cash
     free, so the amount is the user's choice rather than forced. */
  const maxLoan = state.price * R.ltv;          // most HDB will lend
  const minDown = state.price * (1 - R.ltv);    // least you must put in

  /* default: cover as much as savings allow, without exceeding the cap */
  const suggested = Math.max(0, Math.min(maxLoan, state.price - state.savings));
  if(!state.borrowTouched) state.borrow = suggested;

  const loan = Math.max(0, Math.min(state.borrow ?? suggested, maxLoan));
  const down = state.price - loan;               // whatever isn't borrowed

  syncBorrowControl(maxLoan, suggested, loan);

  document.getElementById("rLoan").textContent = sgd(loan);
  document.getElementById("rLoanSub").textContent = loan === 0
    ? "no loan needed — paid in full"
    : `of a ${sgd(maxLoan)} maximum (${R.ltv * 100}% LTV)`;

  document.getElementById("rDown").textContent = sgd(down);
  const dsub = document.getElementById("rDownSub");
  if(down < minDown - 0.5){
    dsub.textContent = `below the ${sgd(minDown)} minimum — borrow less`;
  }else if(state.savings >= down){
    dsub.textContent = down === state.price
      ? "paid entirely from savings ✓"
      : "covered by your savings ✓";
  }else{
    dsub.textContent = "short by " + sgd(down - state.savings);
  }

  /* Monthly repayment — at the rate you actually pay. */
  const m = loan > 0 ? monthlyRepay(loan, state.rate, state.tenure) : 0;
  document.getElementById("rMonthly").textContent = sgd(m);
  document.getElementById("rMonthlySub").textContent = loan > 0
    ? `over ${state.tenure} yrs at ${state.rate}%`
    : "nothing to repay";

  /* Eligibility repayment — at the stress-test floor. This is the figure
     HDB (or the bank) uses to decide how much you may borrow, so it is the
     one that must pass MSR and TDSR. It is always the higher of the two. */
  const stressRate = state.rate === R.hdbLoanRate ? R.hdbStressRate : R.bankStressRate;
  const mStress = loan > 0 ? monthlyRepay(loan, Math.max(stressRate, state.rate), state.tenure) : 0;
  document.getElementById("rStress").textContent = sgd(mStress);
  document.getElementById("rStressSub").textContent = loan > 0
    ? `what ${state.rate === R.hdbLoanRate ? "HDB" : "the bank"} tests you against, at ${Math.max(stressRate, state.rate)}%`
    : "no loan, so no affordability check";

  /* MSR — assessed on the stressed repayment, not the actual one */
  const msrPct = (mStress / state.income) * 100;
  const rMsr = document.getElementById("rMsr");
  rMsr.textContent = msrPct.toFixed(1) + "%";
  const withinMsr = msrPct <= R.msrCap;
  rMsr.className = "v mono " + (withinMsr ? "ok" : "warn");
  const fill = document.getElementById("msrFill");
  fill.style.width = Math.min(100, msrPct / R.msrCap * 100) + "%";
  fill.style.background = withinMsr ? "var(--ok)" : "var(--warn)";
  document.getElementById("rMsrSub").textContent = loan === 0
    ? "No loan, so the ratio doesn't apply."
    : withinMsr
      ? `Within the ${R.msrCap}% cap, tested at ${Math.max(stressRate, state.rate)}%.`
      : `Over the ${R.msrCap}% cap — borrow less, lengthen the tenure, or pick a cheaper flat.`;

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

  /* Minimum cash. Both loan types cap at 75% LTV, so the downpayment is the
     same — but an HDB loan's can be paid entirely from CPF OA, while a bank
     loan needs at least 5% of the price in hard cash whatever your CPF
     balance. That catches people who are CPF-rich but cash-poor. */
  const isHdbLoan = state.rate === R.hdbLoanRate;
  const cashMin = loan > 0
    ? Math.min(down, state.price * (isHdbLoan ? R.cashMinHdb : R.cashMinBank))
    : 0;
  document.getElementById("rCash").textContent = sgd(cashMin);
  const cashSub = document.getElementById("rCashSub");
  if(loan === 0){
    cashSub.textContent = "No loan, so no minimum applies — CPF can cover it all.";
  }else if(isHdbLoan){
    cashSub.textContent = "An HDB loan needs no cash — CPF OA can cover the whole downpayment.";
  }else{
    cashSub.textContent = `A bank loan needs ${R.cashMinBank * 100}% of the price in cash, whatever your CPF balance.`;
  }

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

/* ---------- wire the paired inputs ----------
   One set of listeners only. State is authoritative; each handler repaints
   the *other* control, never its own, so the two can't fight. Writing to
   .value doesn't fire an input event, so there's no feedback loop. */
CONTROLS.forEach(c => {
  const slider = document.getElementById(c.slider);
  const num    = document.getElementById(c.num);
  if(!slider || !num) return;

  /* dragging the slider */
  slider.addEventListener("input", () => {
    state[c.key] = +slider.value;
    if(c.key === "borrow") state.borrowTouched = true;
    syncControls(c.slider);
    render();
  });

  /* typing a figure. The typed number wins even if it's past the slider's
     range — the slider just pins at its end and the box is flagged. */
  num.addEventListener("input", () => {
    const raw = String(num.value).trim();
    if(raw === "" || raw === "-") return;
    const v = parseFloat(raw);
    if(isNaN(v)) return;
    state[c.key] = v;
    if(c.key === "borrow") state.borrowTouched = true;
    syncControls(c.num);
    render();
  });

  /* on leaving the field: empty or below the minimum snaps back */
  num.addEventListener("blur", () => {
    let v = parseFloat(num.value);
    const mn = parseFloat(num.min);
    if(isNaN(v)) v = state[c.key];
    if(!isNaN(mn) && v < mn) v = mn;
    state[c.key] = v;
    syncControls();
    render();
  });
});

/* shortcuts: borrow the cap, or put savings in first */
document.getElementById("borrowMax").addEventListener("click", () => {
  state.borrow = Math.round(state.price * R.ltv);
  state.borrowTouched = true;
  render();
});
document.getElementById("borrowMin").addEventListener("click", () => {
  /* go back to following price and savings automatically */
  state.borrowTouched = false;
  state.borrow = null;
  render();
});

document.getElementById("segType").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  [...e.currentTarget.children].forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  state.type = b.dataset.type;
  const fam = state.type === "family";
  document.getElementById("typeHint").textContent = fam
    ? `Family BTO income ceiling: ${sgd(R.incomeCeilingFamily)} a month.`
    : `Singles aged 35+ can buy a 2-room Flexi; ceiling ${sgd(R.incomeCeilingSingle)} a month.`;
  render();
});

document.getElementById("segLoan").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  [...e.currentTarget.children].forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  state.rate = +b.dataset.rate;
  state.stressRate = b.dataset.stress ? +b.dataset.stress : R.hdbStressRate;
  const hint = document.getElementById("loanHint");
  if(state.rate === R.hdbLoanRate){
    hint.innerHTML = `You pay ${R.hdbLoanRate}% on an HDB loan. Separately, HDB checks how much you may borrow using a ${R.hdbStressRate}% floor — both figures are shown.`;
  }else if(state.rate === R.bankStressRate){
    hint.innerHTML = `A worst-case view: repayment and the affordability check both computed at the ${R.bankStressRate}% floor MAS requires banks to assess against. Useful for stress-testing your budget.`;
  }else{
    hint.innerHTML = `Bank rates vary; ${R.bankLoanRate}% is illustrative. MAS requires banks to assess you against a stricter ${R.bankStressRate}% floor.`;
  }
  render();
});

/* put any saved values back into the controls, then draw */
restoreControls();
render();
