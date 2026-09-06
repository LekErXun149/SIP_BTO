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
| `ballot.html` | Ballot odds — user enters a live application rate from HDB's portal |
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
├── ballot.html           ballot odds simulator
├── guide.html            concepts + quizzes
├── checklist.html        documents and fees
├── 404.html              shown for broken links
│
├── css/
│   └── style.css         ALL styling for every page
│
├── js/
│   ├── nav.js            shared nav bar + footer (injected into every page)
│   ├── sources.js        renders source links and the policy notice
│   ├── progress.js       auto-save, file export/import, close warning
│   ├── block.js          the lit-window block graphic
│   ├── calculator.js     affordability logic
│   ├── journey.js        stage simulator logic
│   ├── ballot.js         ballot odds logic
│   └── quiz.js           quiz component
│
├── data/
│   └── bto-data.js       ALL policy figures and content
│
├── img/
│   ├── favicon.ico       browser tab icon
│   ├── favicon-32.png
│   ├── apple-touch-icon.png
│   └── preview.png       1200x630 card shown when the link is shared
│
├── make_images.py        regenerates the images above (optional)
├── README.md
└── .gitignore
```

The images are generated from the site's own design tokens by `make_images.py`,
so there is no third-party artwork and no licensing question. To change them,
edit the colours at the top of that script and run `python3 make_images.py`.

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

## The ballot simulator, and why it stores no rates

BTO application rates change every launch, so any figure hard-coded here would be
wrong within months. Instead `ballot.html` sends the user to the HDB Flat Portal to
read the live rate for their own applicant type and flat type, and they type it in.
That keeps it accurate with no upkeep.

`BTO_DATA.ballot.examples` holds real published figures from one past launch, used
only by the demo buttons so the tool still works between application windows. Those
are clearly labelled as illustrative. When you refresh them, update
`BTO_DATA.ballot.examplesLaunch` too so the date on screen stays honest.

Output is deliberately a **band** ("Competitive", "Tough") plus a rough ratio, never
a precise percentage — the application rate alone cannot support one, because
priority scheme quotas and ballot chances also affect the draw.

## Cache busting

CSS and JS links carry a version number, e.g. `css/style.css?v=2`. Browsers cache
these files aggressively, so **bump the number in every page** whenever you change
a shared file — otherwise returning visitors keep seeing the old version.

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

## Built with

Plain HTML, CSS and JavaScript. No frameworks, no build tools, no backend.
Fonts are Bricolage Grotesque and IBM Plex, loaded from Google Fonts.
