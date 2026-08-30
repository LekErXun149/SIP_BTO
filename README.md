# KeyQuest — HDB BTO, gamified

An interactive guide to Singapore's HDB Build-To-Order process. Work out what you
can afford, learn the rules that actually matter, and play through all six stages
of the journey from ballot to keys.

**Live site:** https://lekerxun149.github.io/SIP_BTO

Built as a Student Internship Programme (SIP) project.

---

## What it does

| Page | What's on it |
|---|---|
| `index.html` | Homepage — overview and links to everything |
| `calculator.html` | Affordability: income ceiling, EHG grant estimate, downpayment, monthly repayment, MSR and TDSR |
| `journey.html` | The six BTO stages as an interactive walkthrough |
| `guide.html` | Standard/Plus/Prime, flat types, grants, glossary — with quizzes |
| `checklist.html` | Tickable documents and fees needed at each stage |

Progress on all pages saves automatically, and can be exported to a file and
loaded back on another device.

---

## Project structure

```
SIP_BTO/
├── index.html            homepage
├── calculator.html       affordability tool
├── journey.html          six-stage simulator
├── guide.html            concepts + quizzes
├── checklist.html        documents and fees
├── 404.html              shown for broken links
│
├── css/
│   └── style.css         ALL styling for every page
│
├── js/
│   ├── nav.js            shared nav bar + footer (injected into every page)
│   ├── progress.js       auto-save, file export/import, close warning
│   ├── block.js          the lit-window block graphic
│   ├── calculator.js     affordability logic
│   ├── journey.js        stage simulator logic
│   └── quiz.js           quiz component
│
└── data/
    └── bto-data.js       ALL policy figures and content
```

---

## Where to make changes

**Changing a policy figure** (income ceiling, interest rate, grant amount)
→ `data/bto-data.js`, in the `rules` section. Change it once; every page updates.

**Changing colours, fonts or spacing**
→ `css/style.css`, in the `:root` block at the top.

**Adding or editing journey stages**
→ `data/bto-data.js`, the `stages` array.

**Adding a glossary term, grant, or flat type**
→ `data/bto-data.js` — the matching array. The tables build themselves.

**Adding a new page**
→ Create the HTML file, copy the `<head>` from an existing page, then add one line
to the `PAGES` list in `js/nav.js`. The nav and footer appear automatically.

### Adding a quiz

Add an entry to `quizzes` in `data/bto-data.js`:

```js
myQuiz: {
  q: "Your question?",
  options: ["A", "B", "C", "D"],
  answer: 2,          // zero-based — this means "C"
  why: "Explanation shown after answering."
}
```

Then drop this anywhere in `guide.html`:

```html
<div class="quiz-slot" data-quiz="myQuiz"></div>
```

---

## Running it locally

No build step, no installation. Open `index.html` in a browser.

One caveat: saving uses browser storage, which some browsers restrict when a page
is opened directly from disk. **Test the save/load features on the live URL**, not
locally.

---

## Deploying

The site is hosted on GitHub Pages from the `main` branch, root folder.

```bash
git add .
git commit -m "describe what changed"
git push
```

Changes go live in about a minute. If a page looks stale afterwards, hard refresh
with `Ctrl + Shift + R` — that's browser caching, not a failed deploy.

---

## Working as a team

- Don't commit directly to `main` once more than one person is working.
- Create a branch per feature, open a Pull Request, get it reviewed, then merge.
- Pull before you start work and again before you push.
- To undo something already pushed, use `git revert`, never `git reset --hard`
  or force push — those rewrite shared history and break everyone else's copy.

Because CSS, JS and content live in separate files, two people can usually work at
the same time without merge conflicts. Keep it that way.

---

## Accuracy

Figures were checked against publicly available HDB rules as of the date in
`BTO_DATA.lastUpdated` (`data/bto-data.js`). They are estimates for education only,
not financial advice — grant amounts and eligibility depend on an applicant's HFE
letter, and policies change.

Update `lastUpdated` whenever you revise the figures, and verify against
[hdb.gov.sg](https://www.hdb.gov.sg) before doing so.

---

## Built with

Plain HTML, CSS and JavaScript. No frameworks, no build tools, no backend.
Fonts are Bricolage Grotesque and IBM Plex, loaded from Google Fonts.
