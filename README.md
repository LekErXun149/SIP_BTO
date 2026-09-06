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
| `options.html` | What to do if the ballot fails — SBF, open booking, resale |
| `quiz.html` | 20 questions in 5 rounds, with a reason for every option |
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
├── options.html          other routes if BTO doesn't work out
├── quiz.html             20-question quiz, scored
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

### Adding a quiz question

All questions live in `BTO_DATA.quiz.rounds` and appear on `quiz.html`. Append to any
round's `questions` array:

```js
{
  q: "Your question?",
  answer: 1,                    // zero-based — this means the second option
  options: [
    { t: "First option",  why: "Why this one is wrong." },
    { t: "Second option", why: "Correct. Why this one is right." },
    { t: "Third option",  why: "Why this one is wrong." },
    { t: "Fourth option", why: "Why this one is wrong." }
  ]
}
```

**Every option needs its own `why`.** That's the point of the format: someone who picks
the wrong answer sees why *their* choice was wrong alongside why the right one is right.
A generic explanation attached only to the correct answer doesn't do that.

Keep four options per question, and make sure any figures match `BTO_DATA.rules`.

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

## Priority schemes — check before you edit

`BTO_DATA.priority` holds the schemes. **The Married Child Priority Scheme and the
Senior Priority Scheme for living near parents no longer exist** — the Family Care
Scheme (Proximity) replaced both from the July 2025 sales exercises. Many property
websites still describe MCPS as current, so verify against
[HDB's priority schemes page](https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/application/priority-schemes)
rather than a search result.

Every quota is an "up to" figure — an upper limit, not a guarantee. Keep that wording.

## Borrowing is a choice, not a requirement

The 75% loan-to-value figure is a **ceiling** on what HDB will lend, not an amount you
must borrow. If savings cover more than the 25% minimum downpayment, the buyer can
borrow less — or nothing at all.

`calculator.js` therefore treats the loan as a user-controlled value bounded by the cap.
It defaults to whatever savings don't already cover, but stops auto-following the moment
the user sets it themselves (`state.borrowTouched`). Don't "simplify" this back to
`price * 0.75` — that would tell someone who can pay cash that they owe 25 years of
repayments.

## Mobile navigation

Eight pages don't fit across a phone. Above 900px the links sit inline; below that
`js/nav.js` renders a labelled button showing the current page, which opens the full
list as a panel. Both sets of links come from the same `PAGES` array, so adding a page
still means editing one line.

The earlier approach — horizontal scrolling with hidden scrollbars — looked like the
nav was simply cut off, with no cue that more existed. Don't go back to it.

Note also that `position:sticky` on `.jblock-card` is switched off below 860px. Once
the layout stacks into one column, a pinned element scrolls over the content beneath it.

## The EHG tables

`BTO_DATA.ehgTable` holds HDB's published grant bands. They are **not** a smooth taper —
HDB drops $10,000 in some bands and $5,000 in others, with no regular pattern, so any
formula would be wrong in most bands. `js/calculator.js` reads the table directly.

HDB publishes only two distinct tables:

| Table | Assessed on | Used for |
|---|---|---|
| `full` | Full household income | Families; two or more first-timer singles |
| `half` | A single's income, or half the household income | Singles; first-timer/second-timer couples; applicants with a non-resident spouse |

`half` is currently `full` halved exactly on both axes. That is HDB's doing, not an
assumption in the code — `test_ehg.js` asserts it, so if HDB ever changes one table and
not the other the test fails rather than the site quietly going wrong.

When updating, type the bands straight from HDB's PDFs and re-run `node test_ehg.js`.

## Same LTV, different cash

HDB and bank loans both cap at 75% loan-to-value, so the downpayment is 25% either way.
The difference is what it can be paid with: an HDB loan's downpayment can come entirely
from CPF OA, while a bank loan needs at least 5% of the price in hard cash regardless of
CPF balance (`rules.cashMinBank`). Don't collapse these into one figure — a CPF-rich,
cash-poor buyer passes one and fails the other.

## Two interest rates

The calculator uses both, on purpose:

- `hdbLoanRate` (2.6%) — what a buyer actually pays each month.
- `hdbStressRate` (3.0%) — the floor HDB uses to work out how much they may borrow,
  introduced in September 2022 to encourage prudent borrowing.

Monthly repayment is shown at the real rate; the MSR and TDSR checks use the stressed
figure, which is what HDB does. Bank borrowers are assessed against a 4.0% MAS floor.
Don't "simplify" this by collapsing them into one rate — it would make the
affordability check wrong at borderline incomes.

## Two mobile traps to avoid

**Don't use the `padding` shorthand on an element that also has `.wrap`.**
`.wrap` sets `padding: 0 22px` for the side gutters; a shorthand `padding` on the same
element resets those to zero and the text sits flush against the screen edge. Use
`padding-top` / `padding-bottom` instead. This bit `.hero-in` and `.lost`.

**Don't put `flex:none` on a tag whose text can run long.** The priority scheme quota
strings are full sentences; sized to their content inside a flex row they spilled out of
the card. `.scheme-head` stacks vertically and the tag wraps, and the base `.tag` is
capped at `max-width:100%`.

**Don't leave `position:sticky` on when a layout stacks.** The journey block card is
sticky beside the stage card on desktop, but once the grid collapses to one column
the pinned block scrolls over the card below it. It's reset to `position:static`
under 860px.

## Cache busting

CSS and JS links carry a version number, e.g. `css/style.css?v=0.12`. Browsers cache
these files aggressively, so **bump the version in every page** whenever you change
a shared file — otherwise returning visitors keep seeing the old one.

Current version is **0.12**. Increase by 0.1 each time you change any shared CSS or
JS file. A quick find-and-replace across the HTML files does it.

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
