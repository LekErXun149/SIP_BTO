/* ============================================================
   KeyQuest — central data file
   ALL policy numbers and content live here. When HDB changes a
   rule, edit it once in this file and every page updates.

   Note: this is a .js file rather than .json on purpose — a .json
   file loaded with fetch() fails when you open pages directly from
   your computer (file://). This works both locally and on GitHub.
   Figures checked 30 August 2026 against HDB's own pages (see `sources`
   below). Income ceilings were raised at the National Day Rally on
   23 August 2026, effective 24 August 2026 — always re-verify at hdb.gov.sg.
   ============================================================ */

const BTO_DATA = {

  lastUpdated: "30 August 2026",

  /* Official pages each figure came from. Shown on the guide page and
     linked beside the calculator, so anyone can check the numbers. */
  sources: {
    eligibility:  { label: "HDB — flat eligibility and income ceilings",
                    url: "https://www.hdb.gov.sg/residential/buying-a-flat/understanding-your-eligibility-and-housing-loan-options/flat-and-grant-eligibility/couples-and-families" },
    grants:       { label: "HDB / MyNiceHome — CPF housing grants",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-grants-guide/" },
    loans:        { label: "HDB / MyNiceHome — housing loans",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-loans-guide/" },
    msrTdsr:      { label: "MAS — MSR and TDSR rules",
                    url: "https://www.mas.gov.sg/regulation/explainers/new-housing-loans/msr-and-tdsr-rules" },
    classification:{ label: "HDB — Standard, Plus and Prime framework",
                    url: "https://www.hdb.gov.sg/cs/infoweb/residential/buying-a-flat/finding-a-flat/standard-plus-and-prime-housing-models" },
    flatTypes:    { label: "MyNiceHome — flat types and classifications",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-flat-types-classification-guide/" },
    timeline:     { label: "HDB — buying procedure timeline",
                    url: "https://www.hdb.gov.sg/residential/buying-a-flat/buying-procedure-for-new-flats/timeline" },
    ballot:       { label: "HDB — how the BTO ballot works",
                    url: "https://www.hdb.gov.sg/about-us/news-and-publications/publications/hdbspeaks/balloting-process-for-buildtoorder-bto-flats" },
    btoGuide:     { label: "MyNiceHome — how to buy a BTO flat",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-bto-sbf-buying-guide/" },
    priority:     { label: "MyNiceHome — priority schemes",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-priority-schemes-guide/" },
    hfe:          { label: "MyNiceHome — applying for an HFE letter",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-hfe-guide/" }
  },

  /* Recent policy change worth flagging to users. Set to null to hide. */
  notice: {
    date: "24 August 2026",
    text: "Income ceilings were raised at the National Day Rally on 23 August 2026. Families buying a new flat are now assessed against $16,000 (up from $14,000), and singles aged 35+ against $8,000 (up from $7,000). This applies to HFE letter applications from 24 August 2026.",
    source: "https://www.mynicehome.gov.sg/get-started/hdb-grants-guide/"
  },

  /* ---------- policy figures used by the calculator ---------- */
  rules: {
    incomeCeilingFamily: 16000,      // raised from 14000 on 24 Aug 2026
    incomeCeilingSingle: 8000,       // raised from 7000 on 24 Aug 2026
    ehgCeilingFamily: 9000,          // EHG grant income ceiling
    ehgCeilingSingle: 4500,
    incomeCeilingExtended: 24000,    // extended families; each nucleus still capped at 16000
    ehgMaxFamily: 120000,            // raised from 80000 in Aug 2024
    ehgMaxSingle: 60000,             // raised from 40000 in Aug 2024
    hdbLoanRate: 2.6,                // HDB concessionary rate, %
    bankLoanRate: 3.5,               // illustrative bank rate, %
    ltv: 0.75,                       // max loan-to-value for HDB loan
    msrCap: 30,                      // mortgage servicing ratio cap, %
    tdsrCap: 55,                     // total debt servicing ratio cap, %
    optionFeeRange: "$500 – $2,000",
    applicationFee: 10
  },

  /* ---------- the six journey stages ---------- */
  stages: [
    {
      title: "Get your HFE letter",
      time: "~2–3 weeks",
      cost: "Free",
      what: "Apply for your HDB Flat Eligibility letter on the HDB Flat Portal — it pulls your details automatically through Myinfo. The letter confirms what you can buy, which grants you qualify for, and how much you can borrow. Sort this out before you apply for anything.",
      tip: "Apply early. Processing takes time, and the HFE letter is the gateway to everything that follows."
    },
    {
      title: "Apply in a launch",
      time: "1-week window",
      cost: "$10 fee",
      what: "BTO launches open around four times a year — February, May, August and November. During the one-week window you choose up to four projects or units through the portal and pay a $10 application fee.",
      tip: "Watch the live application rates during the week, then apply near the end when you can see how competitive each project has become."
    },
    {
      title: "Ballot & queue number",
      time: "Results in ~2 months",
      cost: "—",
      what: "A computerised ballot assigns your queue number. A queue number is not a guaranteed flat — it only decides your turn to choose. Priority schemes and the 2-Ballot Chance can improve your odds.",
      tip: "Popular 4- and 5-room flats in central locations can have success rates under 10%. Don't count on the first try — the 2-Ballot Chance rewards repeat applications."
    },
    {
      title: "Book & select your flat",
      time: "From ~4 weeks after results",
      cost: "Option fee",
      what: "Based on your queue number you're invited — about two weeks ahead — to pick your actual unit from whatever is left, pay the option fee, and apply for your grants. A lower queue number means far more choice of stack and floor.",
      tip: "Have a backup unit in mind. The best-facing stacks and the ones nearest the MRT go quickly once selection opens."
    },
    {
      title: "Sign the lease",
      time: "Within ~9 months of booking",
      cost: "Downpayment + stamp duty",
      what: "You sign the Agreement for Lease and settle the downpayment and stamp duty, paid with CPF, cash, or a mix of both. This is the point where your flat is locked in.",
      tip: "Reconfirm your financing now — your monthly repayment still has to fit within the 30% Mortgage Servicing Ratio."
    },
    {
      title: "Wait, then collect keys",
      time: "~2.5–4 years build",
      cost: "Remaining payment",
      what: "Construction takes a few years. Before you get the keys you reapply for the HFE letter so HDB can reassess your loan against your current income, settle any remaining payment — and then you collect your keys.",
      tip: "Tradition says roll a pineapple into your new home for good fortune. Three to five years after you started, you're finally home."
    }
  ],

  /* ---------- Standard / Plus / Prime comparison ---------- */
  classification: [
    {
      name: "Standard",
      where: "Islandwide — the largest category of every launch",
      mop: "5 years",
      subsidy: "Standard BTO subsidies",
      clawback: "None on resale",
      resale: "Normal resale rules apply",
      rent: "Whole flat may be rented out after MOP"
    },
    {
      name: "Plus",
      where: "Choicer spots in each region — near MRT, town centres, good amenities",
      mop: "10 years",
      subsidy: "More than Standard",
      clawback: "Roughly 6–8% of resale price",
      resale: "Buyers must meet an income ceiling",
      rent: "Whole-flat rental not allowed"
    },
    {
      name: "Prime",
      where: "The choicest locations — city centre and major town centres",
      mop: "10 years",
      subsidy: "The most of the three",
      clawback: "Around 9% of resale price",
      resale: "Buyers must meet an income ceiling",
      rent: "Whole-flat rental not allowed"
    }
  ],

  /* ---------- flat types ---------- */
  flatTypes: [
    { type:"2-room Flexi", size:"~36–45 sqm", who:"Singles aged 35+, or elderly buyers wanting a shorter lease option" },
    { type:"3-room",       size:"~60–65 sqm", who:"Couples or small families on a tighter budget" },
    { type:"4-room",       size:"~90 sqm",    who:"The most popular choice — comfortable for a young family" },
    { type:"5-room",       size:"~110 sqm",   who:"Larger families, or households needing a study or extra room" }
  ],

  /* ---------- grants ---------- */
  grants: [
    { name:"Enhanced CPF Housing Grant (EHG)", amount:"Up to $120,000 (families) / $60,000 (singles)",
      who:"First-timers. Income ceiling $9,000 for families, $4,500 for singles. The lower your income, the larger the grant. This is the only grant available on a new BTO flat." },
    { name:"CPF Housing Grant for Resale Flats", amount:"Up to $80,000 (2- to 4-room) / $50,000 (5-room or bigger)",
      who:"First-timer families buying a resale flat. Income ceiling $16,000. Not available on BTO." },
    { name:"Proximity Housing Grant (PHG)", amount:"$30,000 living with, or $20,000 living within 4km",
      who:"Buyers living with or near parents or children. Resale flats only, not BTO. Singles receive half." }
  ],

  /* ---------- glossary ---------- */
  glossary: [
    { term:"BTO",  def:"Build-To-Order. A new flat that HDB builds only after enough people apply for the project." },
    { term:"HFE",  def:"HDB Flat Eligibility letter. Confirms what you can buy, your grants, and your loan amount. Needed before you apply." },
    { term:"MOP",  def:"Minimum Occupation Period. How long you must live in the flat before you may sell it — 5 years for Standard, 10 for Plus and Prime." },
    { term:"MSR",  def:"Mortgage Servicing Ratio. Your monthly home loan repayment cannot exceed 30% of your gross monthly income." },
    { term:"TDSR", def:"Total Debt Servicing Ratio. All your monthly debt repayments together cannot exceed 55% of gross monthly income." },
    { term:"LTV",  def:"Loan-To-Value. The share of the flat price you may borrow — up to 75% for an HDB loan, so you need 25% down." },
    { term:"EHG",  def:"Enhanced CPF Housing Grant. The main grant for first-time buyers, worth up to $80,000." },
    { term:"SBF",  def:"Sale of Balance Flats. Leftover or returned flats offered in a separate exercise, often ready much sooner." },
    { term:"2BC",  def:"2-Ballot Chance. First-timers unsuccessful twice get double ballot entries from their third try onwards." },
    { term:"CPF OA", def:"CPF Ordinary Account. The CPF savings you may use for the downpayment and monthly repayments." }
  ],

  /* ---------- quizzes embedded in the guide ---------- */
  quizzes: {
    classification: {
      q: "You buy a Plus flat. How long before you can sell it on the open market?",
      options: ["3 years", "5 years", "10 years", "You can sell any time"],
      answer: 2,
      why: "Plus and Prime flats both carry a 10-year Minimum Occupation Period — double the 5 years for Standard flats. You'd also return part of the subsidy when you sell."
    },
    money: {
      q: "Your household earns $6,000 a month. Your estimated monthly repayment is $2,100. Does that pass the MSR check?",
      options: ["Yes — it's comfortably within", "No — it's over the cap", "MSR doesn't apply to HDB flats", "Only if you take a bank loan"],
      answer: 1,
      why: "MSR caps repayment at 30% of gross monthly income. 30% of $6,000 is $1,800, so $2,100 is over the limit. You'd need a cheaper flat, a longer tenure, or higher income."
    },
    journey: {
      q: "You've received a queue number in the ballot. What does it mean?",
      options: ["A flat is now reserved for you", "It sets your turn to choose from what's left", "You've been rejected", "You must buy within 7 days"],
      answer: 1,
      why: "A queue number only decides when you get to pick. If your number is high, the units you wanted may already be taken by the time your turn comes."
    }
  }
};
