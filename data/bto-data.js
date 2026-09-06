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
     linked beside the calculator, so anyone can check the numbers.

     NOTE: HDB redesigned hdb.gov.sg in 2026 and dropped "/residential/"
     from their URLs, which broke every old link. Most links here point to
     MyNiceHome, HDB's own buyer-facing site, which has been stable.
     If a link 404s, search the page title on hdb.gov.sg rather than
     guessing at a path. */
  sources: {
    eligibility:  { label: "HDB — flat eligibility and income ceilings",
                    url: "https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/couples-and-families" },
    grants:       { label: "HDB MyNiceHome — CPF housing grants",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-grants-guide/" },
    loans:        { label: "HDB MyNiceHome — housing loans",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-loans-guide/" },
    msrTdsr:      { label: "MAS — MSR and TDSR rules",
                    url: "https://www.mas.gov.sg/regulation/explainers/new-housing-loans/msr-and-tdsr-rules" },
    classification:{ label: "HDB — Standard, Plus and Prime framework",
                    url: "https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/finding-a-new-flat/standard-plus-and-prime-housing-framework" },
    flatTypes:    { label: "HDB MyNiceHome — flat types and classifications",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-flat-types-classification-guide/" },
    timeline:     { label: "HDB MyNiceHome — how to buy an HDB flat, step by step",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-buying-guide/" },
    ballot:       { label: "HDB MyNiceHome — current BTO sales launch",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-bto-sales-launch/" },
    btoGuide:     { label: "HDB MyNiceHome — how to buy a BTO flat",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-bto-sbf-buying-guide/" },
    priority:     { label: "HDB — priority schemes (official list)",
                    url: "https://www.hdb.gov.sg/buying-a-flat/bto-sbf-and-open-booking-of-flats/process-for-buying-a-new-flat/application/priority-schemes" },
    priorityGuide:{ label: "HDB MyNiceHome — priority schemes explained",
                    url: "https://www.mynicehome.gov.sg/get-started/hdb-priority-schemes-guide/" },
    familyCare:   { label: "HDB — Family Care Scheme (Proximity) announcement",
                    url: "https://www.hdb.gov.sg/about-us/news-and-publications/press-releases/new-fcs-proximity-better-supports-parents-and-children-to-live-closer-together" },
    hfe:          { label: "HDB MyNiceHome — applying for an HFE letter",
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
    /* Two different rates, doing two different jobs:
       - hdbLoanRate is what you actually PAY (pegged 0.1% above CPF OA).
       - hdbStressRate is the floor HDB uses to work out how much you may
         BORROW. Introduced Sept 2022 to encourage prudent borrowing.
       Banks are held to a stricter MAS floor for the same purpose. */
    hdbLoanRate: 2.6,                // what you pay on an HDB loan, %
    hdbStressRate: 3.0,              // floor HDB uses to compute eligible loan, %
    bankLoanRate: 3.5,               // illustrative bank rate, %
    bankStressRate: 4.0,             // MAS medium-term floor for bank loans, %
    ltv: 0.75,                       // max loan-to-value for HDB loan
    msrCap: 30,                      // mortgage servicing ratio cap, %
    tdsrCap: 55,                     // total debt servicing ratio cap, %
    optionFeeRange: "$500 – $2,000",
    applicationFee: 10
  },


  /* ---------- ballot simulator ----------
     No application rates are hard-coded as "the" rate. The user reads a
     live figure off the HDB Flat Portal and types it in, so this data
     never goes stale. The examples below are real published figures from
     one past launch, used only to demonstrate how the tool behaves
     outside an application window. Update or extend them freely. */
  ballot: {
    portalUrl: "https://homes.hdb.gov.sg/home/landing",
    portalLabel: "HDB Flat Portal — live application rates",

    /* ballot chances by applicant type */
    applicantTypes: [
      { id:"ft-family",  label:"First-timer family",              chances:2,
        note:"Married couples and families buying their first flat." },
      { id:"ft-pmc",     label:"First-timer, parents or married couple", chances:3,
        note:"FT(PMC): first-timer families with children, or married couples aged 40 and below." },
      { id:"ft-single",  label:"First-timer single (35+)",        chances:1,
        note:"Buying a 2-room Flexi on your own." },
      { id:"second",     label:"Second-timer",                    chances:1,
        note:"You have bought a subsidised flat before. Odds are usually much tougher." }
    ],

    /* how to read the result — bands, not false precision */
    bands: [
      { max:1.0,  label:"More flats than applicants",  tone:"ok",
        meaning:"Fewer people applied than there are units in your category. Almost everyone who applies should be offered a flat." },
      { max:2.0,  label:"Good chance",                 tone:"ok",
        meaning:"Competition is mild. A reasonable share of applicants in your category will be offered a flat this exercise." },
      { max:5.0,  label:"Competitive",                 tone:"mid",
        meaning:"Clearly oversubscribed. Many applicants will miss out, and you may need more than one attempt." },
      { max:12.0, label:"Tough",                       tone:"warn",
        meaning:"Heavily oversubscribed. Most applicants will not be offered a flat this exercise." },
      { max:Infinity, label:"Very tough",              tone:"warn",
        meaning:"Extremely oversubscribed. Only a small fraction of applicants will succeed. Consider a less popular project, or the resale market." }
    ],

    /* Real published figures from the June 2026 exercise, for the demo
       button. Source: BTO_DATA.sources.ballot and press coverage. */
    examplesLaunch: "June 2026 BTO exercise",
    examples: [
      { name:"Sembawang Portico / Brook — 4-room (Standard)",
        rate:0.6, type:"ft-family",
        blurb:"Fewer first-timer applicants than units. Standard classification, shorter waiting time, less popular estate." },
      { name:"Kebun Baru, Ang Mo Kio — 4-room (Plus)",
        rate:1.3, type:"ft-family",
        blurb:"592 units drew 1,122 applications. Healthy but not frantic demand; Plus means a 10-year MOP." },
      { name:"Berlayar Rise, Bukit Merah — 4-room (Prime)",
        rate:3.3, type:"ft-family",
        blurb:"5,285 applicants for 988 units. Prime classification in a central location." },
      { name:"Berlayar Rise — 4-room, second-timers",
        rate:23.9, type:"second",
        blurb:"The same project seen from a second-timer's position. Same flats, very different odds." },
      { name:"Woodgrove Acres, Woodlands — 2-room Flexi, singles",
        rate:17.8, type:"ft-single",
        blurb:"157 units drew over 1,053 applications. Singles compete for a small reserved pool." }
    ]
  },


  /* ---------- "what if BTO doesn't work out" page ----------
     Mostly writing — safe for a non-coder teammate to edit. Each route
     is one card on options.html. Keep `check` short; it renders as a tag. */
  options: {
    intro: "A BTO ballot can go against you, and for some households BTO isn't the best route at all. None of that is the end of the road — here's what else exists.",

    routes: [
      {
        name: "Try again next launch",
        check: "Free",
        what: "An unsuccessful ballot costs you nothing but time. Your HFE letter stays valid for 9 months, so you can usually apply again without redoing the paperwork. Launches run several times a year.",
        why: "Odds have improved recently — in the February 2026 exercise the median first-timer family rate was 0.8 for 3-room and larger flats, meaning supply outstripped demand in that category.",
        watch: "Check your HFE letter's expiry before the next window. If it has lapsed, reapply early — processing takes weeks."
      },
      {
        name: "Use your extra ballot chances",
        check: "Automatic",
        what: "First-timers who are unsuccessful twice get additional ballot chances from their third attempt onwards under the 2-Ballot Chance scheme. First-timer families already get 2 chances, and FT(PMC) households get 3.",
        why: "Persistence is built into the system by design. Repeated attempts genuinely raise your odds rather than resetting them.",
        watch: "From the February 2027 exercise, first-timer families will also receive one additional ballot chance for each Singapore Citizen child aged 18 and below."
      },
      {
        name: "Aim at a less subscribed project",
        check: "Same process",
        what: "Application rates vary enormously within a single launch. In June 2026 one Sembawang project drew fewer first-timer applicants than it had units, while a Bukit Merah Prime project drew 3.3 times as many.",
        why: "Changing which project you apply for is the single biggest lever you control. Non-mature towns and Standard classification are usually far less contested.",
        watch: "Weigh the trade-off honestly — a shorter queue often means a longer commute or fewer amenities nearby."
      },
      {
        name: "Sale of Balance Flats (SBF)",
        check: "Separate exercise",
        what: "SBF offers flats left unselected from earlier launches, plus units returned by buyers. Many are already built or close to completion.",
        why: "The wait can be dramatically shorter than BTO's three to five years — sometimes you can move in within months.",
        watch: "Choice is limited to whatever is left, and competition can be intense precisely because the flats are ready."
      },
      {
        name: "Open Booking of Flats",
        check: "First come, first served",
        what: "Flats still unselected after an SBF exercise are released for open booking. There is no ballot — you apply and can book a flat as soon as the next working day.",
        why: "It removes the ballot from the equation entirely. If you need a home urgently, this is the fastest route into a new flat.",
        watch: "Availability is unpredictable and stock moves quickly. You need your HFE letter ready in advance to act."
      },
      {
        name: "Buy a resale flat",
        check: "No ballot, no income ceiling",
        what: "Resale flats are bought on the open market from existing owners. There is no ballot and no income ceiling to purchase, though income limits still apply to grants and HDB loans.",
        why: "You choose the exact unit, town and floor, and move in within months rather than years. This is the main route for households above the BTO income ceiling.",
        watch: "Prices are set by the market, not subsidised, so the upfront cost is higher. Grants offset some of this — first-timer families can receive up to $230,000 in total grants on a resale flat, against $120,000 on a BTO."
      }
    ],

    /* practical extras that used to have nowhere to live */
    practical: [
      {
        name: "Where do you live while you wait?",
        body: "BTO construction takes roughly two and a half to four years. Most buyers stay with family, rent privately, or apply for the Parenthood Provisional Housing Scheme (PPHS), which offers subsidised interim rental of a whole flat to eligible families waiting for their BTO. There is also a PPHS voucher scheme to offset open-market rent for some households."
      },
      {
        name: "Renovation is not in the flat price",
        body: "This is the cost that most often catches first-time buyers out. A new flat comes bare — flooring, built-in carpentry, kitchen fittings and lighting are all yours to arrange. Budget for it separately and early, and remember it is largely a cash expense, since CPF cannot be used for renovation."
      },
      {
        name: "Backing out has consequences",
        body: "Rejecting or not turning up to a flat selection appointment, or cancelling after booking, can cost you. Depending on the stage you may forfeit your option fee and face a period during which you cannot apply again. Read the terms in your booking letter before deciding — the penalties are real but the specifics vary by situation."
      }
    ]
  },


  /* ---------- priority schemes ----------
     WARNING TO ANYONE EDITING THIS: the Married Child Priority Scheme
     (MCPS) and the Senior Priority Scheme for living near parents were
     REPLACED by the Family Care Scheme (Proximity) from the July 2025
     sales exercises. Many property websites still describe MCPS as
     current — they are out of date. Check hdb.gov.sg, not Google.
     Source: sources.priority and sources.familyCare */
  priority: {
    intro: "The ballot isn't one big draw. HDB reserves slices of every launch for particular households, so qualifying for a scheme means competing inside a smaller pool instead of the open one. Every quota below is an upper limit — \"up to\" — not a guarantee that all reserved units get taken.",

    /* the baseline everyone should understand first */
    ballotChances: [
      { who:"First-timer family",                    chances:2, note:"The standard for married couples and families buying their first flat." },
      { who:"First-Timer (Parents & Married Couples)", chances:3, note:"FT(PMC): first-timer families with a child aged 18 or below, or married couples aged 40 and below." },
      { who:"First-timer single (35+)",              chances:1, note:"Buying a 2-room Flexi under the Single Singapore Citizen Scheme." },
      { who:"Second-timer",                          chances:1, note:"You have bought a subsidised flat before." }
    ],

    schemes: [
      {
        name: "Family & Parenthood Priority Scheme (FPPS)",
        who: "First-timer married couples with a child aged 18 or below, and young married couples.",
        quota: "Up to 40% of BTO flats, up to 60% of SBF",
        note: "The broadest scheme by far. Applying for a 4-room or smaller Standard flat gives FPPS applicants first call on that reserved share."
      },
      {
        name: "Family Care Scheme (Proximity)",
        who: "Parents and their children — married or single — applying to live together or near each other.",
        quota: "Up to 30% of BTO flats for first-timers; up to 5% BTO and 3% SBF for second-timers",
        note: "Replaced the Married Child Priority Scheme and the Senior Priority Scheme from July 2025. Applying to live WITH your parents ranks above living NEAR them (within 4km), and the arrangement must hold through the 5-year MOP."
      },
      {
        name: "Family Care Scheme (Joint Balloting)",
        who: "Parents and their children applying together for two units in the same project.",
        quota: "Projects offering 2-room Flexi or 3-room flats",
        note: "A joint application for two flats in one project, so both generations move in near each other at the same time."
      },
      {
        name: "Third Child Priority Scheme (TCPS)",
        who: "Families with three or more children — and, since June 2026, families expecting a third.",
        quota: "Up to 10% of BTO flats and SBF units",
        note: "The quota doubled from 5% in June 2026 and eligibility widened. Open to both first- and second-timer households."
      },
      {
        name: "Senior Priority Scheme",
        who: "Seniors buying a 2-room Flexi flat to age in place in a familiar area.",
        quota: "Set aside within each launch",
        note: "Still runs for seniors buying to age in place. The separate senior priority for living near children now sits under the Family Care Scheme instead."
      },
      {
        name: "Tenants' Priority Scheme (TPS)",
        who: "Tenants of HDB rental flats buying a home of their own.",
        quota: "Set aside within each launch",
        note: "A route out of public rental into ownership."
      },
      {
        name: "ASSIST",
        who: "Divorced or widowed parents with children, buying again.",
        quota: "Set aside within each launch",
        note: "Assistance Scheme for Second-Timers. Recognises that a second purchase after divorce or bereavement isn't an upgrade."
      }
    ],

    /* things that aren't schemes but change your odds */
    alsoMatters: [
      { name:"First-timers get most of the supply",
        body:"Before any scheme applies, HDB sets aside at least 95% of 4-room and larger flats, and 85% of 3-room flats in non-mature areas, for first-timers. This is why first-timer and second-timer application rates for the very same flats look so different." },
      { name:"First-timer singles have their own share",
        body:"Up to 65% of 2-room Flexi BTO flats and up to 5% of Sale of Balance Flats are set aside for first-timer singles, after seniors are allocated." },
      { name:"An extra chance per child, from February 2027",
        body:"From the February 2027 sales exercise, first-timer families will receive one additional ballot chance for each Singapore Citizen child aged 18 and below — so larger families get proportionally more entries." },
      { name:"Quotas are ceilings, not floors",
        body:"Every figure here is an \"up to\". If fewer scheme applicants apply than the quota allows, the unused units return to the general pool. Qualifying improves your position; it never guarantees a flat." }
    ]
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
    priority: {
      q: "A first-timer family with a 3-year-old child applies for a BTO flat. How many ballot chances do they get?",
      options: ["1", "2", "3", "Unlimited"],
      answer: 2,
      why: "Having a child aged 18 or below puts them in the First-Timer (Parents & Married Couples) category, which carries 3 ballot chances instead of the standard 2 for first-timer families. Second-timers and singles get 1."
    },
    journey: {
      q: "You've received a queue number in the ballot. What does it mean?",
      options: ["A flat is now reserved for you", "It sets your turn to choose from what's left", "You've been rejected", "You must buy within 7 days"],
      answer: 1,
      why: "A queue number only decides when you get to pick. If your number is high, the units you wanted may already be taken by the time your turn comes."
    }
  }
};
