# DK Polymer: clickable website prototype (v0.1)

Low-fidelity, greyscale, clickable prototype of the DK Polymer website, for walking stakeholders through page structure, navigation and user flows. **This is not the final design.**

- Static, multi-page [Astro](https://astro.build) site. Every page is a real URL.
- All content lives in `src/data/*.json`, separate from layout.
- No backend. Forms check entries in the browser and redirect to `/thank-you/`. Nothing is stored or sent.
- Unconfirmed facts are shown as highlighted `[PLACEHOLDER: …]` markers. Nothing is invented: no certifications, capacities, customers, test values, prices or testimonials.

Start the walkthrough at **`/prototype-map/`**. It lists every page, the three user journeys, and the SEO and AI files. Use **Show annotations** in the top banner to label each section's purpose (SEO, GEO, GSEO, AEO, NFR, CONVERSION, UX).

---

## Run locally

Requires Node.js 18.20+ (tested on Node 22).

```bash
npm install
npm run dev        # http://localhost:4321 with live reload
npm run build      # static site into dist/
npm run preview    # serve dist/ locally
```

### Verify

```bash
npm run verify
```

This runs, in order:

| Step | Script | What it checks |
|---|---|---|
| Build | `astro build` (+ `prebuild` generates the placeholder datasheet PDFs) | Build completes with no errors |
| Links | `scripts/check-links.mjs` | Every internal `href`/`src` resolves to a built file, every `#anchor` exists, every sitemap `<loc>` is a built page, robots/llms/sitemap files exist |
| JSON-LD | `scripts/jsonld-report.mjs` | Every JSON-LD block parses; prints page → schema types → robots; fails if a page has ≠ 1 `<h1>` or a Product has `offers` |
| Browser tests | `playwright test` | Screenshots + behaviour tests (below) |

Other scripts:

- `npm run report:placeholders` rewrites the [placeholder list](#open-placeholders-by-page) at the end of this README from the built site. Run it after `npm run build` whenever content changes.

### Browser tests (Playwright)

`tests/prototype.spec.ts` runs in these projects:

| Project | Engine | Viewport |
|---|---|---|
| `chromium-desktop` | Chromium | 1440 × 900 |
| `chromium-iphone14` | Chromium (mobile emulation) | 390 × 844 |
| `webkit-desktop` | WebKit (Safari engine) | 1440 × 900 |
| `webkit-iphone14` | WebKit (iPhone 14 emulation) | 390 × 844 |

The tests:

- Save full-page screenshots of Home, the PBT GF30 grade page, Request a Quote and Sell Your Scrap into `/screenshots/`, named `<project>-<page>.png`.
- Check that the mobile menu opens and closes (including on Escape) and that desktop navigation is visible.
- Check that an empty RFQ submit is blocked: the URL stays the same, the error summary is shown and focused, and the fields are marked `aria-invalid`.
- Check that `?grade=` pre-fills the RFQ form and that a valid submit reaches `/thank-you/?type=quote`.
- Check that the robots meta tag matches the `PROTOTYPE` flag.
- Check that the annotations toggle works and persists across pages.

**WebKit has to be installed separately:** `npx playwright install webkit`. If it is missing, `playwright.config.ts` prints a warning and runs only the Chromium projects. To make a missing WebKit fail the run instead, set `REQUIRE_WEBKIT=1`.

> Status of the v0.1 commit: WebKit could not be downloaded in the build environment because the network policy blocked the Playwright CDN. So far only the Chromium projects have run, and `/screenshots/` contains only Chromium images. Before signing off on iPhone Safari, run `npm run verify` on a machine with WebKit installed, or on a real iPhone.

---

## Prototype indexing guard (`PROTOTYPE` flag)

`src/data/site.json` → `"PROTOTYPE": true` (default).

| | `PROTOTYPE: true` (now) | `PROTOTYPE: false` (launch) |
|---|---|---|
| `<meta name="robots">` on every page | `noindex, nofollow` | `index, follow` (and `noindex, follow` on `/thank-you/`, `/prototype-map/`, 404) |
| `/robots.txt` | `Disallow: /` | Production rules + `Sitemap:` line |
| `/robots.production.txt` | Always generated, so it can be shown in the walkthrough | (same) |
| Sitemaps, `llms.txt` | Always generated | (same) |

**To switch the guard off at launch:**

1. Replace the placeholder domain: set `"siteUrl"` in `src/data/site.json` to the real domain (canonical tags, sitemaps, JSON-LD and robots all use it).
2. Set `"PROTOTYPE": false`.
3. Remove the prototype banner and the `/prototype-map/` page if they are not wanted in production (`src/components/PrototypeBanner.astro`, `src/pages/prototype-map/`, and its entry in `src/lib/pages.ts`).
4. `npm run verify`, then deploy. In Google Search Console, submit `https://<domain>/sitemap-index.xml`.

---

## Deploy as a static site

The output is plain files in `dist/`. Any static host works.

**Netlify:** build command `npm run build`, publish directory `dist`. `404.html` is picked up automatically.

**Vercel:** framework preset "Astro" (or "Other"), build command `npm run build`, output directory `dist`.

**GitHub Pages** (project site at `https://<user>.github.io/DK-Polymer/`): the site must know its sub-path. Build with:

```bash
SITE_URL=https://<user>.github.io BASE_PATH=/DK-Polymer npm run build
```

All internal links go through `href()` in `src/lib/url.ts`, so they pick up the base path. Publish `dist/`, for example with the official `actions/upload-pages-artifact` + `actions/deploy-pages` workflow, and set the same env vars in that job. With a custom domain at the root, leave `BASE_PATH` unset.

---

## Pages

| URL | Page | Notes |
|---|---|---|
| `/` | Home | Hero, two audience paths, sourcing flow, grades, industries, trust strip, key facts, FAQ preview, CTA |
| `/products/` | Grades overview | Comparison table |
| `/products/pbt-natural/` | Grade page | Template `src/pages/products/[slug].astro` |
| `/products/pbt-black/` | Grade page | |
| `/products/pbt-glass-filled-30/` | Grade page | |
| `/industries/` | Industries overview | |
| `/industries/electrical-electronics/` | Industry page | Template `src/pages/industries/[slug].astro` |
| `/industries/automotive-components/` | Industry page | |
| `/industries/home-appliances/` | Industry page | |
| `/quality/` | QA process, test parameters, certificates, traceability | |
| `/sell-your-scrap/` | Scrap supplier path | WhatsApp CTA + supplier form |
| `/about/` | Company, facility, key facts | |
| `/resources/` | Articles index | |
| `/resources/what-is-recycled-pbt/` | Sample article | Article JSON-LD |
| `/faq/` | 9 buyer + 6 supplier questions | FAQPage JSON-LD |
| `/request-a-quote/` | RFQ form | `?grade=<slug>` and `?sample=yes` pre-fill |
| `/contact/` | NAP, hours, map placeholder, directions | |
| `/thank-you/` | Confirmation (noindex) | `?type=quote` / `?type=scrap` changes the message |
| `/privacy/` | Privacy placeholder | |
| `/404.html` | Not found | |
| `/prototype-map/` | Walkthrough hub (noindex) | |
| `/robots.txt`, `/robots.production.txt` | Robots | See indexing guard |
| `/sitemap-index.xml` → `/sitemap-pages.xml`, `/sitemap-products.xml`, `/sitemap-industries.xml` | Sitemaps | Generated from `src/lib/pages.ts` |
| `/llms.txt` | Summary for AI assistants | Generated from the data files |
| `/downloads/datasheet-<grade>.pdf` | Placeholder datasheets | Generated by `scripts/make-datasheets.mjs` |

---

## Where to edit content

| What | File |
|---|---|
| Company name, NAP (address, phone, email), WhatsApp number and messages, hours, geo, key facts, navigation, "last updated" date, `PROTOTYPE` flag | `src/data/site.json` |
| Grades: names, summaries, spec table rows, MOQ, lead time, which industries they serve | `src/data/products.json` |
| Industries: intro, buyer problems, quality expectations (suitable grades come from `products.json`) | `src/data/industries.json` |
| FAQ questions and answers (`audience`: buyer/supplier; `home: true` shows on Home) | `src/data/faqs.json` |
| Article metadata | `src/data/articles.json` (body in `src/pages/resources/what-is-recycled-pbt.astro`) |
| Page list for sitemaps, llms.txt and prototype map | `src/lib/pages.ts` |
| Styles (one stylesheet, CSS variables) | `src/styles/global.css` |

Any text containing `[PLACEHOLDER…]` is rendered with a visible marker automatically (`src/lib/text.ts`). When a fact is confirmed, replace the bracketed text in the data file.

Because the data files are plain JSON, they can later move into a CMS (e.g. WordPress custom fields or a headless CMS) without changing the page structure.

### Components (`src/components/`)

`Header`, `Footer`, `Breadcrumbs`, `PrototypeBanner` (annotation toggle), `StickyMobileCta`, `CTA`, `SpecTable`, `FAQItem`, `KeyFacts`, `ProcessSteps`, `GradeCard`, `IndustryCard`, `NapBlock`, `ImageBox` (grey image placeholder; real images should use `loading="lazy"` and width/height), `Ph` (placeholder marker), `Annotation`, `ErrorSummary`, `JsonLd`. JSON-LD builders: `src/lib/schema.ts`.

---

## SEO / GEO / GSEO / AEO implementation

- **SEO:** a unique `<title>` and meta description per page; exactly one `<h1>` (checked); semantic `header/nav/main/article/footer`; self-referencing canonical; Open Graph tags; breadcrumbs plus BreadcrumbList; split XML sitemaps.
- **GEO:** NAP rendered only from `site.json` through `NapBlock`; LocalBusiness JSON-LD on Home, About and Contact; map placeholder, "Get directions" and Google Business Profile links on `/contact/`; `wa.me` click-to-chat links.
- **GSEO:** Key facts as short citable sentences on Home and About; specs in HTML tables; visible "Last updated" in the footer that matches `dateModified` in the WebPage and Article JSON-LD; `/llms.txt`.
- **AEO:** question-style headings with a direct 1–2 sentence answer immediately below; `/faq/` with FAQPage JSON-LD.
- **Structured data per page:** Organization, WebSite, WebPage and BreadcrumbList on every page; LocalBusiness on Home, About and Contact; Product on each grade; FAQPage on `/faq/`; Article on the sample article. Run `npm run report:jsonld` for the table.

### Product JSON-LD and pricing

Product markup **deliberately omits `offers` / price**, because pricing is undecided; `jsonld-report.mjs` fails the build if `offers` appears. Specs are published as `additionalProperty`. **Google's Rich Results Test will warn** that `offers`, `review` or `aggregateRating` is missing, and product rich results will not show, until pricing is decided. The warning is expected, not a bug. Do not add placeholder prices or fake reviews to silence it.

### Placeholder values inside JSON-LD

LocalBusiness `geo` (latitude and longitude), `openingHours`, `postalCode`, `legalName` and the article author currently contain `[PLACEHOLDER…]` strings. They are valid JSON but not valid schema values. Replace them in `site.json` and `articles.json` before switching `PROTOTYPE` off.

---

## Non-functional notes

- **Performance:** static HTML; about 3.4 KB of JavaScript per page at most (menu, annotation toggle, form validation, pre-fill); no third-party scripts, fonts or trackers; one small CSS file. A Lighthouse run has not been done in this environment yet.
- **Accessibility:** skip link; visible focus outlines; keyboard menu (`aria-expanded`, Escape closes); labelled fields with hints and inline errors linked by `aria-describedby`; a focused error summary; greyscale contrast ≥ 4.5:1; alt text on all image placeholders (`role="img"` + `aria-label`); 44 px touch targets; 16 px inputs so iOS doesn't zoom.
- **Security:** no secrets, no external form endpoints, no trackers. The only storage is the annotation preference in `localStorage`.
- **Analytics-ready:** CTAs carry `data-event` (+ `data-event-location`, `data-grade`) attributes. Nothing is wired up.

---

## Open placeholders by page

Everything below needs an answer from the business owner. The list is generated from the built site, so it always matches what stakeholders see.

<!-- PLACEHOLDERS:START -->
_Generated by `npm run report:placeholders`. 118 distinct placeholders._

### Global (header, footer, NAP block: every page)

- [PLACEHOLDER: confirm PIN]
- [PLACEHOLDER: phone number]
- [PLACEHOLDER: email address]
- [PLACEHOLDER: WhatsApp number]

### /about/

- [PLACEHOLDER: founding story: who started DK Polymer, when and why]
- [PLACEHOLDER: confirm whether to mention sales channels publicly]
- [PLACEHOLDER: milestones, e.g. new machinery, capacity expansions]
- [PLACEHOLDER: floor area]
- [PLACEHOLDER: grinders, dryers, extruders]
- [PLACEHOLDER: testing equipment]
- [PLACEHOLDER: team size]
- [PLACEHOLDER: year]
- [PLACEHOLDER: capacity]
- [PLACEHOLDER: confirm regions]
- [PLACEHOLDER: confirm whether any other polymers are processed]

### /contact/

- [PLACEHOLDER: e.g. Monday to Saturday, 09:30 to 18:30]
- [PLACEHOLDER: Google Business Profile link]

### /faq/

- [PLACEHOLDER: Yes or No. Confirm whether every batch is tested, which parameters are measured and whether a test report ships with each delivery.]
- [PLACEHOLDER: confirm grade list and whether custom grades are possible.]
- [PLACEHOLDER: MOQ in kg]
- [PLACEHOLDER: confirm sample policy, sample size and whether samples are free or charged.]
- [PLACEHOLDER: typical lead time]
- [PLACEHOLDER: add DK Polymer's own comparison data once available.]
- [PLACEHOLDER: confirm delivery regions and whether delivery is included in the price.]
- [PLACEHOLDER: list any certificates actually held. None are confirmed for this prototype.]
- [PLACEHOLDER: confirm whether supplied]
- [PLACEHOLDER: confirm whether glass-filled, coloured or mixed scrap is accepted.]
- [PLACEHOLDER: minimum kg]
- [PLACEHOLDER: confirm area, e.g. Delhi NCR]
- [PLACEHOLDER: confirm segregation rules and whether they affect the price.]
- [PLACEHOLDER: describe how scrap price is set, e.g. by type and quality, and payment terms.]

### /

- [PLACEHOLDER: competitive advantage, e.g. what makes DK Polymer granules different]
- [PLACEHOLDER: grinding, drying, extrusion steps]
- [PLACEHOLDER: tests per batch]
- [PLACEHOLDER: confirm grade name and code]
- [PLACEHOLDER: confirm grade name, code and glass fibre percentage]
- [PLACEHOLDER: what is tested per batch]
- [PLACEHOLDER: none confirmed]
- [PLACEHOLDER: sample policy]
- [PLACEHOLDER: year]
- [PLACEHOLDER: capacity]
- [PLACEHOLDER: confirm regions]
- [PLACEHOLDER: Yes or No. Confirm whether every batch is tested, which parameters are measured and whether a test report ships with each delivery.]
- [PLACEHOLDER: confirm grade list and whether custom grades are possible.]
- [PLACEHOLDER: confirm whether glass-filled, coloured or mixed scrap is accepted.]

### /industries/automotive-components/

- [PLACEHOLDER: confirm which tiers or parts current customers supply]
- [PLACEHOLDER: buyer problem confirmed in conversations with automotive molders]
- [PLACEHOLDER: confirm grade name and code]
- [PLACEHOLDER: confirm grade name, code and glass fibre percentage]
- [PLACEHOLDER: list any. Do not claim approvals that do not exist]

### /industries/electrical-electronics/

- [PLACEHOLDER: confirm which parts current customers mold]
- [PLACEHOLDER: buyer problem confirmed in conversations with electrical molders]
- [PLACEHOLDER: confirm grade name and code]
- [PLACEHOLDER: confirm grade name, code and glass fibre percentage]
- [PLACEHOLDER: parameters]
- [PLACEHOLDER: state whether any grade is suitable for flame-retardant applications. Do not claim this without test data]

### /industries/home-appliances/

- [PLACEHOLDER: confirm which parts current customers mold]
- [PLACEHOLDER: buyer problem confirmed in conversations with appliance molders]
- [PLACEHOLDER: confirm grade name and code]
- [PLACEHOLDER: parameters]
- [PLACEHOLDER: how this is controlled]

### /privacy/

- [PLACEHOLDER: full privacy notice to be drafted and reviewed, e.g. against India's Digital Personal Data Protection Act, 2023]
- [PLACEHOLDER: data collected by forms, purpose, retention, who processes it, analytics and cookies]
- [PLACEHOLDER: grievance officer or privacy contact]

### /products/

- [PLACEHOLDER: confirm final grade list and whether custom grades or compounding are offered]
- [PLACEHOLDER: glass fibre % value]
- [PLACEHOLDER: MFI value]
- [PLACEHOLDER: nominal 30, confirm tolerance]
- [PLACEHOLDER: confirm grade name and code]
- [PLACEHOLDER: confirm grade name, code and glass fibre percentage]

### /products/pbt-black/

- [PLACEHOLDER: confirm grade name and code]
- [PLACEHOLDER: confirm whether filled or unfilled, colouring method and typical use]
- [PLACEHOLDER: datasheet content to be supplied]
- [PLACEHOLDER: MFI value]
- [PLACEHOLDER: MFI test method and conditions]
- [PLACEHOLDER: moisture value]
- [PLACEHOLDER: moisture test method]
- [PLACEHOLDER: glass fibre % value]
- [PLACEHOLDER: glass fibre % test method]
- [PLACEHOLDER: tensile strength value]
- [PLACEHOLDER: tensile strength test method]
- [PLACEHOLDER: colour description]
- [PLACEHOLDER: e.g. bag size in kg]
- [PLACEHOLDER: confirm if supplied with each delivery]
- [PLACEHOLDER: typical parts molded with this grade]
- [PLACEHOLDER: minimum order quantity]
- [PLACEHOLDER: lead time]
- [PLACEHOLDER: pricing approach undecided]

### /products/pbt-glass-filled-30/

- [PLACEHOLDER: confirm grade name, code and glass fibre percentage]
- [PLACEHOLDER: confirm glass content tolerance and typical use]
- [PLACEHOLDER: datasheet content to be supplied]
- [PLACEHOLDER: MFI value]
- [PLACEHOLDER: MFI test method and conditions]
- [PLACEHOLDER: moisture value]
- [PLACEHOLDER: moisture test method]
- [PLACEHOLDER: nominal 30, confirm tolerance]
- [PLACEHOLDER: glass fibre % test method, e.g. ash content]
- [PLACEHOLDER: tensile strength value]
- [PLACEHOLDER: tensile strength test method]
- [PLACEHOLDER: colour description]
- [PLACEHOLDER: e.g. bag size in kg]
- [PLACEHOLDER: confirm if supplied with each delivery]
- [PLACEHOLDER: typical parts molded with this grade]
- [PLACEHOLDER: minimum order quantity]
- [PLACEHOLDER: lead time]
- [PLACEHOLDER: pricing approach undecided]

### /products/pbt-natural/

- [PLACEHOLDER: confirm grade name and code]
- [PLACEHOLDER: confirm source material, typical use and how it compares with virgin PBT]
- [PLACEHOLDER: datasheet content to be supplied]
- [PLACEHOLDER: MFI value]
- [PLACEHOLDER: MFI test method and conditions]
- [PLACEHOLDER: moisture value]
- [PLACEHOLDER: moisture test method]
- [PLACEHOLDER: glass fibre % value]
- [PLACEHOLDER: glass fibre % test method]
- [PLACEHOLDER: tensile strength value]
- [PLACEHOLDER: tensile strength test method]
- [PLACEHOLDER: colour description]
- [PLACEHOLDER: e.g. bag size in kg]
- [PLACEHOLDER: confirm if supplied with each delivery]
- [PLACEHOLDER: typical parts molded with this grade]
- [PLACEHOLDER: minimum order quantity]
- [PLACEHOLDER: lead time]
- [PLACEHOLDER: pricing approach undecided]

### /quality/

- [PLACEHOLDER: summarise QA approach in one sentence]
- [PLACEHOLDER: what is checked on arrival, e.g. material type, contamination]
- [PLACEHOLDER: how scrap is sorted by grade and colour]
- [PLACEHOLDER: grinding, drying and extrusion controls]
- [PLACEHOLDER: which tests, how often, in-house or external lab]
- [PLACEHOLDER: release criteria and documents sent with the batch]
- [PLACEHOLDER: direct 1–2 sentence answer, e.g. which parameters are tested on every batch]
- [PLACEHOLDER: MFI test method and conditions]
- [PLACEHOLDER: Melt flow index (MFI) test frequency]
- [PLACEHOLDER: moisture test method]
- [PLACEHOLDER: Moisture content test frequency]
- [PLACEHOLDER: glass fibre % test method]
- [PLACEHOLDER: Glass fibre content test frequency]
- [PLACEHOLDER: tensile strength test method]
- [PLACEHOLDER: Tensile strength test frequency]
- [PLACEHOLDER: none confirmed]
- [PLACEHOLDER: certificate 1 name]
- [PLACEHOLDER: issuer, scope, validity]
- [PLACEHOLDER: certificate 2 name]
- [PLACEHOLDER: certificate 3 name]
- [PLACEHOLDER: confirm how batches are numbered and what records are kept]
- [PLACEHOLDER: lot ID format]
- [PLACEHOLDER: batch ID format]
- [PLACEHOLDER: report reference]
- [PLACEHOLDER: confirm]

### /request-a-quote/

- [PLACEHOLDER: confirm sample policy]

### /resources/

- [PLACEHOLDER: future article, e.g. How to specify recycled PBT]

### /resources/what-is-recycled-pbt/

- [PLACEHOLDER: author name and role]
- [PLACEHOLDER: DK Polymer-specific tests]
- [PLACEHOLDER: technical review of this article by DK Polymer before publishing]

### /sell-your-scrap/

- [PLACEHOLDER: confirm whether traders or other sources are accepted]
- [PLACEHOLDER: pbt rejects (molded parts) condition requirements]
- [PLACEHOLDER: pbt runners and sprues condition requirements]
- [PLACEHOLDER: glass-filled pbt accepted? yes/no]
- [PLACEHOLDER: glass-filled pbt condition requirements]
- [PLACEHOLDER: coloured pbt accepted? yes/no]
- [PLACEHOLDER: coloured pbt condition requirements]
- [PLACEHOLDER: purgings and lumps accepted? yes/no]
- [PLACEHOLDER: purgings and lumps condition requirements]
- [PLACEHOLDER: mixed or contaminated plastic accepted? yes/no]
- [PLACEHOLDER: mixed or contaminated plastic condition requirements]
- [PLACEHOLDER: typical response time]
- [PLACEHOLDER: collection area, vehicle, payment terms]
- [PLACEHOLDER: any further rules and how segregation affects price]
- [PLACEHOLDER: confirm whether glass-filled, coloured or mixed scrap is accepted.]
- [PLACEHOLDER: minimum kg]

### /thank-you/

- [PLACEHOLDER: response time]

### Structured data only (JSON-LD, not visible on page)

- [PLACEHOLDER: registered legal name]
- [PLACEHOLDER: latitude]
- [PLACEHOLDER: longitude]
- [PLACEHOLDER: e.g. Mo-Sa 09:30-18:30]
- [PLACEHOLDER: confirm other regions or export markets]

<!-- PLACEHOLDERS:END -->
