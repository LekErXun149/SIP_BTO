/* ============================================================
   Journey simulator — six stages, one lit floor each.
   Stage content lives in data/bto-data.js.
   ============================================================ */

const stages = BTO_DATA.stages;
const journeyBlock = document.getElementById("journeyBlock");
buildBlock(journeyBlock, stages.length, 4);

let step = PROGRESS.get("journeyStep") || 0;   // restored from saved progress

function renderStage(){
  const card = document.getElementById("stageCard");
  if(step > stages.length) step = stages.length;
  if(step < 0) step = 0;
  PROGRESS.set("journeyStep", step);
  lightFloors(journeyBlock, step);

  document.getElementById("jBarFill").style.width = (step / stages.length * 100) + "%";
  document.getElementById("jProgress").textContent =
    step === 0 ? "Not started" :
    step === stages.length ? "Home — 6 of 6 cleared 🔑" :
    `Stage ${step} of ${stages.length}`;

  /* finished */
  if(step === stages.length){
    card.innerHTML = `
      <div class="win-celebrate">
        <div class="big">🔑🍍</div>
        <h3>Keys collected — welcome home.</h3>
        <p>You've walked all six stages, from your first form to your front door.
           In real life that's three to five years, but every lit window was a step worth taking.</p>
      </div>
      <div class="jnav">
        <button class="btn btn-line" id="prevBtn">← Back</button>
        <button class="btn btn-amber" id="restartBtn">Start over</button>
      </div>`;
    document.getElementById("prevBtn").onclick    = () => { step--; renderStage(); };
    document.getElementById("restartBtn").onclick = () => { step = 0; renderStage(); };
    return;
  }

  const s = stages[step];
  card.innerHTML = `
    <div class="stage-no">STAGE ${String(step + 1).padStart(2, "0")} / ${String(stages.length).padStart(2, "0")}</div>
    <h3>${s.title}</h3>
    <div class="stage-meta">
      <span class="tag">⏱ ${s.time}</span>
      <span class="tag">💲 ${s.cost}</span>
    </div>
    <p>${s.what}</p>
    <div class="tip"><b>Tip · </b>${s.tip}</div>
    <div class="jnav">
      <button class="btn btn-line" id="prevBtn" ${step === 0 ? "disabled" : ""}>← Back</button>
      <button class="btn btn-dark" id="nextBtn">${step === stages.length - 1 ? "Collect keys 🔑" : "Clear stage →"}</button>
    </div>`;
  document.getElementById("prevBtn").onclick = () => { if(step > 0){ step--; renderStage(); } };
  document.getElementById("nextBtn").onclick = () => { step++; renderStage(); };
}

renderStage();
