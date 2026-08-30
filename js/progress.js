/* ============================================================
   Progress saving — used by every page.

   Three things happen here:
   1. Auto-save. Any change is written to the browser's storage
      straight away, so returning to this device just works.
   2. File export / import. Downloads a small .json file the user
      can keep, back up, or load on another device.
   3. A warning on closing the tab, but only when there are
      changes that haven't been written to a file yet.

   Load order matters: this file must come AFTER data/bto-data.js
   and BEFORE calculator.js / journey.js, because those read
   saved values when they start up.
   ============================================================ */

const PROGRESS = (function(){

  const KEY = "keyquest-progress-v1";
  const EMPTY = { journeyStep: 0, calculator: null, checklist: {}, savedAt: null };

  let data = structuredClone(EMPTY);
  let dirtySinceExport = false;   // changed since last file download?

  /* ---------- storage ---------- */
  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(raw) data = Object.assign(structuredClone(EMPTY), JSON.parse(raw));
    }catch(e){
      /* storage blocked or data corrupt — carry on with a blank slate */
      console.warn("Could not read saved progress:", e);
    }
  }

  function persist(){
    try{
      data.savedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(data));
    }catch(e){
      console.warn("Could not save progress:", e);
    }
    dirtySinceExport = true;
    paintStatus();
  }

  /* ---------- public getters / setters ---------- */
  function get(section){ return data[section]; }

  function set(section, value){
    data[section] = value;
    persist();
  }

  function setChecklistItem(id, checked){
    data.checklist[id] = checked;
    persist();
  }

  function hasAnything(){
    return data.journeyStep > 0
        || data.calculator !== null
        || Object.values(data.checklist).some(Boolean);
  }

  /* ---------- export to file ---------- */
  function exportFile(){
    const payload = {
      app: "KeyQuest",
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `keyquest-progress-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dirtySinceExport = false;
    flash("Saved to your downloads ✓");
    paintStatus();
  }

  /* ---------- import from file ---------- */
  function importFile(file){
    const reader = new FileReader();
    reader.onload = e => {
      try{
        const parsed = JSON.parse(e.target.result);
        const incoming = parsed.progress || parsed;   // tolerate a bare progress object
        if(typeof incoming !== "object" || incoming === null) throw new Error("wrong shape");

        data = Object.assign(structuredClone(EMPTY), incoming);
        localStorage.setItem(KEY, JSON.stringify(data));
        dirtySinceExport = false;
        flash("Progress loaded — refreshing…");
        setTimeout(() => window.location.reload(), 700);
      }catch(err){
        flash("That file couldn't be read. Use a KeyQuest progress file.", true);
      }
    };
    reader.onerror = () => flash("Couldn't open that file.", true);
    reader.readAsText(file);
  }

  function reset(){
    if(!confirm("Clear all saved progress on this device? This can't be undone.")) return;
    data = structuredClone(EMPTY);
    try{ localStorage.removeItem(KEY); }catch(e){}
    dirtySinceExport = false;
    window.location.reload();
  }

  /* ---------- the bar, injected on every page ---------- */
  function buildBar(){
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="save-bar">
        <div class="wrap save-in">
          <div class="save-status" id="saveStatus"></div>
          <div class="save-actions">
            <button class="save-btn" id="saveExport" title="Download your progress as a file">↓ Save to file</button>
            <button class="save-btn" id="saveImport" title="Load a progress file">↑ Load file</button>
            <button class="save-btn ghost" id="saveReset" title="Clear saved progress">Reset</button>
            <input type="file" id="saveInput" accept="application/json,.json" hidden>
          </div>
        </div>
        <div class="save-flash" id="saveFlash"></div>
      </div>
    `);

    const exportBtn = document.getElementById("saveExport");
    const resetBtn  = document.getElementById("saveReset");
    const importBtn = document.getElementById("saveImport");
    const fileInput = document.getElementById("saveInput");

    /* if the bar didn't render for any reason, saving still works silently */
    if(exportBtn) exportBtn.onclick = exportFile;
    if(resetBtn)  resetBtn.onclick  = reset;
    if(importBtn && fileInput){
      importBtn.onclick = () => fileInput.click();
      fileInput.onchange = e => {
        if(e.target.files[0]) importFile(e.target.files[0]);
        e.target.value = "";   // let the same file be picked again later
      };
    }
    paintStatus();
  }

  function paintStatus(){
    const el = document.getElementById("saveStatus");
    if(!el) return;
    if(!hasAnything()){
      el.innerHTML = `<span class="dot idle"></span>Nothing saved yet — your progress will be kept automatically as you go.`;
      return;
    }
    const bits = [];
    if(data.journeyStep > 0) bits.push(`journey stage ${data.journeyStep}`);
    if(data.calculator)      bits.push("calculator");
    const ticked = Object.values(data.checklist).filter(Boolean).length;
    if(ticked) bits.push(`${ticked} checklist item${ticked === 1 ? "" : "s"}`);

    el.innerHTML = dirtySinceExport
      ? `<span class="dot warn"></span>Saved on this device (${bits.join(", ")}) — not yet downloaded as a file.`
      : `<span class="dot ok"></span>Saved on this device and downloaded (${bits.join(", ")}).`;
  }

  function flash(msg, isError){
    const el = document.getElementById("saveFlash");
    if(!el) return;
    el.textContent = msg;
    el.className = "save-flash show" + (isError ? " error" : "");
    setTimeout(() => { el.className = "save-flash"; }, 3200);
  }

  /* ---------- warn on closing, only when it matters ---------- */
  window.addEventListener("beforeunload", e => {
    if(dirtySinceExport && hasAnything()){
      e.preventDefault();
      e.returnValue = "";   // browsers show their own generic message
    }
  });

  /* ---------- start ---------- */
  load();
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", buildBar);
  }else{
    buildBar();
  }

  return { get, set, setChecklistItem, exportFile, importFile, hasAnything };
})();
