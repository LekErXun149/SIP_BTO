/* ============================================================
   Sources and policy notice.
   Every figure on the site should be traceable to an official
   page. All URLs live in BTO_DATA.sources.

   Two ways to use this:
     <div class="notice-slot"></div>          renders the current policy notice
     <div class="src-slot" data-src="grants"></div>   renders one source link
     <div class="src-all"></div>              renders the full source list
   ============================================================ */

(function renderNotice(){
  const n = BTO_DATA.notice;
  document.querySelectorAll(".notice-slot").forEach(slot => {
    if(!n){ slot.remove(); return; }
    slot.innerHTML = `
      <div class="notice">
        <div class="n-label">Policy update · ${n.date}</div>
        <p>${n.text} <a href="${n.source}" target="_blank" rel="noopener">Check HDB's figures →</a></p>
      </div>`;
  });
})();

(function renderSingleSources(){
  document.querySelectorAll(".src-slot").forEach(slot => {
    const key = slot.dataset.src;
    const s = BTO_DATA.sources[key];
    if(!s){ slot.remove(); return; }
    slot.innerHTML = `<div class="src-line">
      <a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>
    </div>`;
  });
})();

(function renderAllSources(){
  document.querySelectorAll(".src-all").forEach(slot => {
    const items = Object.values(BTO_DATA.sources).map(s =>
      `<a class="src-item" href="${s.url}" target="_blank" rel="noopener">
         <span>${s.label}</span><span class="arrow">↗</span>
       </a>`).join("");
    slot.innerHTML = `
      <div class="src-list">${items}</div>
      <p class="src-note">
        Every figure on this site comes from one of these official pages, last checked
        ${BTO_DATA.lastUpdated}. Where a number is an estimate rather than a published
        figure — the EHG grant amount, for instance — it says so where it appears.
        HDB confirms your actual eligibility, grants and loan in your HFE letter.
      </p>`;
  });
})();
