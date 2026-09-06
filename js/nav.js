/* ============================================================
   Shared navigation + footer
   Written once here, injected into all five pages.
   Add a page? Add one line to PAGES below and it appears everywhere.
   ============================================================ */

const PAGES = [
  { file: "index.html",      label: "Home" },
  { file: "calculator.html", label: "Affordability" },
  { file: "journey.html",    label: "The journey" },
  { file: "ballot.html",     label: "Ballot odds" },
  { file: "guide.html",      label: "Guide" },
  { file: "options.html",    label: "Other routes" },
  { file: "quiz.html",       label: "Quiz" },
  { file: "checklist.html",  label: "Checklist" }
];

(function buildNav(){
  // which page are we on?
  let current = window.location.pathname.split("/").pop();
  if (!current || current === "") current = "index.html";

  const links = PAGES.map(p =>
    `<a href="${p.file}"${p.file === current ? ' class="active" aria-current="page"' : ''}>${p.label}</a>`
  ).join("");

  const currentLabel = (PAGES.find(p => p.file === current) || PAGES[0]).label;

  /* Eight pages don't fit across a phone. Wide screens get the links inline;
     narrow ones get a labelled button that opens them as a panel, so nothing
     is hidden off the edge of the screen. */
  document.body.insertAdjacentHTML("afterbegin", `
    <nav>
      <div class="wrap nav-in">
        <a class="brand" href="index.html">
          <span class="key-dot"><span></span></span>KeyQuest
        </a>
        <div class="nav-links" id="navLinks">${links}</div>
        <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navMenu">
          <span class="nav-current">${currentLabel}</span>
          <span class="nav-burger" aria-hidden="true"><span></span><span></span><span></span></span>
          <span class="sr-only">Open menu</span>
        </button>
      </div>
      <div class="nav-menu" id="navMenu" hidden>
        <div class="wrap nav-menu-in">${links}</div>
      </div>
    </nav>
  `);

  const toggle = document.getElementById("navToggle");
  const menu   = document.getElementById("navMenu");

  function setOpen(open){
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("open", open);
  }

  toggle.addEventListener("click", e => {
    e.stopPropagation();
    setOpen(menu.hidden);
  });

  /* tapping anywhere else, or pressing Escape, closes it */
  document.addEventListener("click", e => {
    if(!menu.hidden && !menu.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", e => {
    if(e.key === "Escape" && !menu.hidden){ setOpen(false); toggle.focus(); }
  });
  /* if the screen widens back to the inline layout, don't leave it open */
  window.addEventListener("resize", () => {
    if(window.innerWidth > 900 && !menu.hidden) setOpen(false);
  });
})();

(function buildFooter(){
  const updated = (typeof BTO_DATA !== "undefined") ? BTO_DATA.lastUpdated : "";
  document.body.insertAdjacentHTML("beforeend", `
    <footer>
      <div class="wrap">
        <div class="disclaimer">
          <b>About these numbers.</b> KeyQuest is an educational tool built to make the BTO process
          easier to understand — it is not financial, legal, or housing advice. Figures reflect publicly
          available rules and are estimates only. Your actual eligibility, grants, and loan depend on your
          HDB Flat Eligibility (HFE) letter, and policies change.
          <b>Always verify with HDB at hdb.gov.sg and the HDB Flat Portal before making any decisions.</b>
        </div>
        <div class="foot-mark">KeyQuest · figures last checked ${updated} · built for SIP</div>
      </div>
    </footer>
  `);
})();
