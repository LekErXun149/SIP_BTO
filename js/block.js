/* ============================================================
   The block facade — KeyQuest's signature visual.
   Shared by the homepage and the journey page.
   ============================================================ */

function buildBlock(el, floors, winsPerFloor){
  if(!el) return;
  el.innerHTML = "";
  for(let f = 0; f < floors; f++){
    const row = document.createElement("div");
    row.className = "floor";
    for(let w = 0; w < winsPerFloor; w++){
      const win = document.createElement("div");
      win.className = "win";
      row.appendChild(win);
    }
    el.appendChild(row);
  }
}

/* light n floors, from the ground floor upward */
function lightFloors(el, n){
  if(!el) return;
  const rows = [...el.children];
  rows.forEach((row, i) => {
    row.classList.toggle("lit", i >= rows.length - n);
  });
}
