/* ============================================================
   Shared navigation + footer
   Written once here, injected into all five pages.
   Add a page? Add one line to PAGES below and it appears everywhere.
   ============================================================ */

const PAGES = [
  { file: "index.html",      label: "Home" },
  { file: "calculator.html", label: "Affordability" },
  { file: "journey.html",    label: "The journey" },
  { file: "guide.html",      label: "Guide" },
  { file: "checklist.html",  label: "Checklist" }
];

(function buildNav(){
  // which page are we on?
  let current = window.location.pathname.split("/").pop();
  if (!current || current === "") current = "index.html";

  const links = PAGES.map(p =>
    `<a href="${p.file}"${p.file === current ? ' class="active" aria-current="page"' : ''}>${p.label}</a>`
  ).join("");

  document.body.insertAdjacentHTML("afterbegin", `
    <nav>
      <div class="wrap nav-in">
        <a class="brand" href="index.html">
          <span class="key-dot"><span></span></span>KeyQuest
        </a>
        <div class="nav-links">${links}</div>
      </div>
    </nav>
  `);
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
