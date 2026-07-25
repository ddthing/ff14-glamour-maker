# SEO, GEO, and AdSense Remediation Implementation Plan

## Delivery rules

- Execute phases in order; do not resume advertising during this plan.
- Add or update regression checks before changing each behavior.
- Keep the interactive maker and existing local presets compatible.
- Do not include unrelated untracked workspace files.
- Commit each independently verified phase.

## Phase 0 — Isolate monetization exposure

### Tests

- Add a repository SEO contract test that asserts:
  - `index.html` has no AdSense-serving script;
  - the ownership meta tag uses the expected publisher ID;
  - `ads.txt` retains the same publisher ID;
  - tracked application source has no manual ad component.

### Implementation

- Replace the AdSense-serving script in `index.html` with
  `google-adsense-account` ownership metadata.
- Delete `src/components/ads/AdBanner.tsx` and obsolete global declarations.
- Keep `public/ads.txt` for ownership verification.
- Remove unused starter assets if no tracked reference exists.

### Verification

- Run the SEO contract test, full tests, lint, and build.
- Confirm the production HTML contains no `googlesyndication` request.

## Phase 1 — Repair canonical host and crawl signals

### Tests

- Assert no source/public runtime signal contains the obsolete host.
- Parse `robots.txt` and assert `/assets/` is crawlable and the sitemap uses the
  production origin.
- Parse `sitemap.xml` and assert:
  - every URL uses the production origin;
  - the expected route set is present;
  - no `priority`, `changefreq`, or same-URL `hreflang` remains.

### Implementation

- Centralize the production origin in an SEO configuration module.
- Correct canonical, Open Graph, image, and JSON-LD URLs.
- Rewrite `robots.txt`.
- Replace the sitemap with the canonical Korean route set.

### Verification

- Run contract tests and inspect the built public files.

## Phase 2 — Give each route an independent identity

### Tests

- Add metadata unit tests for every public route.
- Assert each indexable route has:
  - a unique title and description;
  - a self-referencing canonical;
  - route-appropriate Open Graph values;
  - application JSON-LD only on `/`.
- Assert an unknown route selects the not-found page.

### Implementation

- Define typed route metadata in a focused SEO module.
- Replace the global language-only metadata hook with route-aware metadata.
- Add a not-found component and route selection boundary.
- Keep Korean as the indexed source language; language switching changes
  visible UI metadata without publishing false `hreflang` annotations.

### Verification

- Run route and metadata tests plus the full suite.

## Phase 3 — Prerender official information routes

### Tests

- Add a build-output checker that opens generated HTML for:
  - `/`
  - `/guide`
  - `/about`
  - `/privacy`
  - `/terms`
- Assert each document contains its route H1, canonical, title, and description.
- Assert unknown-route hosting behavior is represented by a generated 404 page.

### Implementation

- Add a deterministic post-build prerender script using project-owned content,
  without introducing a runtime server.
- Generate route directories with `index.html` documents.
- Include a concise factual home summary in initial HTML.
- Preserve client bootstrapping and existing Cloudflare Pages behavior.
- Add a generated `404.html` and adjust redirects so known prerendered documents
  resolve directly.

### Verification

- Run a production build and the output checker.
- Serve `dist` locally and inspect raw and rendered route output.

## Phase 4 — Replace approval copy with official documentation

### Tests

- Add content-contract tests for required guide sections and document dates.
- Assert notices are not linked until at least one genuine notice exists.
- Assert the standalone FAQ route is removed from navigation and sitemap.

### Implementation

- Rewrite `/guide` from verified application behavior:
  - supported uploads;
  - crop workflow;
  - equipment and dye selection;
  - title and creator;
  - preset lifecycle;
  - PNG export;
  - mobile use;
  - local processing and storage;
  - known errors and unsupported behavior.
- Consolidate real FAQ material into troubleshooting.
- Strengthen `/about` with operator, data-source, update-scope, attribution, and
  current monetization-status facts.
- Do not create `/updates` until a real user-facing notice exists.

### Verification

- Cross-check labels and behavior against components, hooks, and tests.
- Review Korean source copy for unsupported claims and AI-style filler.

## Phase 5 — Align privacy and terms

### Tests

- Assert the Korean source policy discloses:
  - local storage;
  - local photo processing;
  - third-party cookies or storage;
  - IP addresses and identifiers;
  - web beacons or equivalent technology;
  - advertising is currently paused;
  - a contact route.

### Implementation

- Update Privacy to describe current behavior and conditional future advertising.
- Update Terms and About so “non-commercial,” support, and advertising statements
  do not conflict.
- Add the Google partner-data-use link only where the disclosure refers to
  Google advertising.
- Leave CMP activation as an external operational gate for any future ad
  reactivation.

### Verification

- Confirm policy copy matches observed network behavior with ads paused.

## Phase 6 — Final release validation

- Run all tests.
- Run ESLint.
- Run TypeScript and the production build.
- Run SEO build-output and lazy-chunk checks.
- Search tracked runtime files for:
  - obsolete host;
  - AdSense-serving script;
  - blocked `/assets/`;
  - false same-URL `hreflang`;
  - `meta keywords`.
- Inspect the built home, guide, about, privacy, terms, and 404 documents.
- Commit only verified project changes.

## External follow-up gates

These require owner accounts or an authoritative rights decision and are not
silently automated:

- confirm FFXIV material monetization rights;
- configure AdSense Privacy and Messaging or a certified CMP if ads resume;
- submit the corrected sitemap in Search Console;
- inspect representative production URLs in Search Console;
- evaluate search demand before creating `/en/` and `/ja/` URL trees.
