/* ============================================================
   Affordability calculator
   All policy numbers come from data/bto-data.js — none are
   hard-coded here.
   ============================================================ */

const R = BTO_DATA.rules;
const sgd = n => "$" + Math.round(n).toLocaleString("en-SG");

let state = {
  type: "family",
  income: 8000,
  savings: 80000,
  price: 450000,
  rate: R.hdbLoanRate,
  tenure: 25,
  debts: 0
};

/* Enhanced CPF Housing Grant — tiered estimate */
function ehg(income, isFamily){
  const ceiling = isFamily ? R.ehgCeilingFamily : R.ehgCeilingSingle;
  if(income > ceiling) return 0;
  const maxGrant = isFamily ? R.ehgMaxFamily : R.ehgMaxSingle;
  const baseBand = isFamily ? 1500 : 750;
  const bandSize = isFamily ? 500  : 250;
  const step     = isFamily ? 5000 : 2500;
  if(income <= baseBand) return maxGrant;
  const bandsAbove = Math.ceil((income - baseBand) / bandSize);
  return Math.max(0, maxGrant - bandsAbove * step);
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

  /* monthly repayment */
  const m = monthlyRepay(loan, state.rate, state.tenure);
  document.getElementById("rMonthly").textContent = sgd(m);
  document.getElementById("rMonthlySub").textContent = `over ${state.tenure} yrs at ${state.rate}%`;

  /* MSR */
  const msrPct = (m / state.income) * 100;
  const rMsr = document.getElementById("rMsr");
  rMsr.textContent = msrPct.toFixed(1) + "%";
  const withinMsr = msrPct <= R.msrCap;
  rMsr.className = "v mono " + (withinMsr ? "ok" : "warn");
  const fill = document.getElementById("msrFill");
  fill.style.width = Math.min(100, msrPct / R.msrCap * 100) + "%";
  fill.style.background = withinMsr ? "var(--ok)" : "var(--warn)";
  document.getElementById("rMsrSub").textContent = withinMsr
    ? `Within the ${R.msrCap}% cap — this repayment looks sustainable.`
    : `Over the ${R.msrCap}% cap — lower the price, lengthen the tenure, or raise income.`;

  /* TDSR — includes other debts */
  const tdsrPct = ((m + state.debts) / state.income) * 100;
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
  render();
});

render();
