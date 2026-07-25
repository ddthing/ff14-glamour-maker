# SEO, GEO, and AdSense Remediation Design

## 1. Purpose

This work restores crawlability and page identity, replaces approval-oriented
content with official product documentation, and isolates monetization until
the use of FFXIV materials for advertising revenue has been confirmed.

The order of work is intentional:

1. stop policy and rights exposure;
2. repair technical search signals;
3. make important content available without client-side rendering;
4. publish factual product documentation;
5. revisit multilingual search and advertising only after the foundations pass.

## 2. Non-goals

- Do not optimize for keyword density or arbitrary article length.
- Do not invent user questions, product history, expertise, testimonials, or
  release notes.
- Do not add `llms.txt`, AI-specific schema, or other speculative GEO files for
  Google visibility.
- Do not resume ad serving as part of the SEO implementation.
- Do not create locale URLs until each locale can provide an independently
  crawlable document.

## 3. Monetization and rights gate

Until the right to earn advertising revenue while using FFXIV names, icons,
screenshots, and other materials has been confirmed:

- remove the AdSense script that requests and inserts ads;
- remove unused manual ad components;
- prevent Auto Ads from creating slots on application and policy pages;
- retain only a non-serving AdSense ownership method when account verification
  is still required:
  - `google-adsense-account` metadata; and
  - a valid root `ads.txt`;
- record the rights decision outside marketing copy before considering ad
  reactivation.

Ko-fi and other financial support links require the same consistency review.
The site must not describe itself as non-commercial while presenting an
unqualified monetization or support flow.

AdSense may be reconsidered only when all of the following are true:

1. the rights position has been confirmed by an authoritative source or written
   permission;
2. the privacy disclosure matches the actual advertising data flow;
3. a Google-certified consent solution is configured where required;
4. ads are limited to pages with sufficient publisher content and safe
   placement;
5. automated and manual policy checks pass.

## 4. Technical SEO recovery

### 4.1 Canonical host

Define the production origin once and use it for:

- canonical URLs;
- Open Graph URLs and images;
- structured data URLs and images;
- sitemap URLs;
- the sitemap declaration in `robots.txt`.

The production origin is:

`https://ff14-glamour-maker.pages.dev`

No generated search signal may refer to the obsolete
`https://ff14-glamour.pages.dev` origin.

### 4.2 Crawlability

Remove the `/assets/` disallow rule. The Vite-generated JavaScript and CSS are
required to understand the current application shell.

The public `robots.txt` must:

- allow public pages and required assets;
- declare the sitemap on the production origin;
- avoid blocking resources solely to reduce index entries.

### 4.3 Sitemap

The sitemap includes only canonical, indexable pages:

- `/`
- `/guide`
- `/about`
- `/privacy`
- `/terms`
- `/updates` after the first genuine notice exists

`/faq` is omitted while its content is consolidated into the guide.

Remove `changefreq` and `priority`. Include `lastmod` only when it can be
generated from a real document update date. Do not publish multiple
`hreflang` values that resolve to the same URL.

### 4.4 Route identity and failures

Each indexable route owns:

- a unique title;
- a unique meta description;
- a self-referencing canonical;
- route-appropriate Open Graph metadata;
- route-appropriate structured data, if any.

The home route alone may use `WebApplication` structured data. Legal and
informational routes must not inherit it.

Unknown paths must not silently become an indexable copy of the home page. They
must produce a clear not-found document and the hosting layer must return a 404
status where supported.

## 5. Rendering architecture

Important informational content must exist in the initial HTML response.

The preferred implementation keeps Vite and React while adding build-time
prerendering for:

- `/guide`
- `/about`
- `/privacy`
- `/terms`
- `/updates` when content exists

The home response also contains a concise, factual description of the tool and
its core workflow before client rendering. The interactive maker remains a
client application.

Acceptance criteria:

- requesting an informational URL with a non-rendering HTTP client returns its
  H1 and core body text;
- disabling JavaScript does not remove the official guide or policy text;
- React interaction and lazy-loaded application features continue to work;
- generated pages contain the correct route metadata before JavaScript runs.

## 6. Official product documentation

### 6.1 Editorial standard

Documentation is operational product content, not approval filler.

Every statement must be derived from:

- current application behavior;
- validated configuration;
- an official policy or data source;
- a real release or support event.

The writing must:

- use the labels users see in the interface;
- describe actions and resulting behavior;
- disclose limitations and recovery steps;
- show a published or updated date;
- avoid unsupported superlatives, keyword repetition, generic introductions,
  and fabricated experience;
- keep Korean as the source document and preserve meaning in translations.

Documentation changes are part of feature completeness. A change to a label,
workflow, storage behavior, external service, or user-required migration must
update the relevant document in the same change.

### 6.2 `/guide`: official user manual

The guide covers verified product behavior:

1. what the maker does;
2. supported image formats and limits;
3. uploading a character portrait;
4. positioning and cropping the portrait;
5. searching and selecting equipment;
6. entering dye information;
7. entering a title and creator;
8. saving, restoring, and deleting presets;
9. exporting the completed card;
10. mobile usage;
11. where photos and presets are processed or stored;
12. troubleshooting known errors;
13. currently unsupported behavior.

Examples and screenshots must be generated from the actual application.

### 6.3 `/updates`: notices and release history

This is a product notice stream, not a search blog. Create the route only when
there is a genuine notice.

Each entry contains:

- version or deployment date;
- changed behavior;
- user impact;
- compatibility with existing data;
- known issues;
- any required user action.

Past notices must not be reconstructed without reliable release evidence.
Internal refactors with no user impact do not receive a notice.

### 6.4 FAQ lifecycle

The current small FAQ is consolidated into the guide's troubleshooting section.
An independent `/faq` may return when repeated real questions justify it.

Valid sources are:

- recurring user inquiries;
- repeated production errors;
- behavior that the interface cannot explain clearly;
- privacy or local-processing questions.

FAQ structured data is considered only when the same questions and answers are
visibly published.

### 6.5 About and policy pages

`/about` documents:

- the product purpose;
- the operator and contact route;
- data sources and update scope;
- supported functionality;
- the unofficial fan-project relationship;
- the actual advertising and support status;
- rights attribution.

`/privacy` and `/terms` remain operational policy documents, not ranking
content. They must match actual behavior.

## 7. Privacy and advertising transparency

Before ads can resume, the privacy policy must disclose the actual handling of:

- cookies and local storage;
- IP addresses and other identifiers;
- web beacons or equivalent ad technologies;
- Google and other third-party providers;
- personalization and measurement purposes;
- user controls and withdrawal choices;
- locally processed photos and locally stored presets.

Add the appropriate Google partner-data-use reference. Confirm the AdSense
dashboard's Privacy and Messaging configuration. If ads are served to users in
the EEA, UK, or Switzerland, configure and test a Google-certified CMP and the
required consent signals.

Do not claim that third-party advertising data is anonymous unless that claim
is technically and contractually accurate.

## 8. Multilingual search strategy

### 8.1 Initial release

Treat Korean as the only search-indexed document language. Keep the in-app
language selector as a user feature, but do not publish same-URL `hreflang`
annotations.

### 8.2 Future locale URLs

Introduce `/ko/`, `/en/`, and `/ja/` only when each locale provides:

- server- or build-rendered localized HTML;
- a locale-specific title and description;
- a self-referencing canonical;
- equivalent navigation and page coverage;
- reciprocal `hreflang` links and an `x-default` where appropriate.

Locale expansion is driven by measured search and product demand, not by the
presence of translated UI strings alone.

## 9. Cleanup

Remove:

- `meta keywords`;
- sitemap `changefreq` and `priority`;
- same-URL multilingual `hreflang`;
- unused `AdBanner` code;
- unused Vite starter assets;
- home application schema from non-home routes;
- standalone thin FAQ content after consolidation.

Keep and improve:

- About;
- Privacy;
- Terms;
- the official guide;
- Search Console verification;
- `ads.txt` only while an AdSense ownership relationship is intentionally
  retained.

## 10. Delivery phases and gates

### Phase 0 — Exposure isolation

- stop ad serving;
- remove dormant unsafe ad UI;
- reconcile non-commercial and support language;
- document the rights decision gate.

Gate: no advertising request or injected slot is observed.

### Phase 1 — Search signal repair

- correct the production origin;
- fix robots and sitemap;
- implement route metadata;
- handle unknown paths.

Gate: every indexable route reports one correct canonical and unique metadata.

### Phase 2 — Crawlable rendering

- prerender informational routes and home summary;
- verify non-JavaScript responses.

Gate: core text and metadata are present in raw HTML responses.

### Phase 3 — Official documentation

- rewrite the guide from verified behavior;
- consolidate FAQ;
- strengthen About;
- add the notices system only with a real entry.

Gate: every claim maps to current product behavior or a named official source.

### Phase 4 — Privacy and policy alignment

- update privacy and terms;
- verify consent requirements and dashboard configuration.

Gate: policy text matches observed data flow and monetization state.

### Phase 5 — Search validation

- run automated tests, lint, and production build;
- inspect raw and rendered output;
- validate structured data;
- submit the production sitemap;
- inspect representative URLs in Search Console.

Gate: no blocked render resource, canonical conflict, soft 404, or structured
data mismatch remains.

### Phase 6 — Optional expansion

- assess demand for locale URLs;
- reconsider AdSense only after the rights and privacy gates pass.

## 11. Testing strategy

Add automated checks for:

- no obsolete production host in tracked public or source files;
- required assets allowed by `robots.txt`;
- sitemap URL set and canonical host;
- one canonical per generated page;
- unique route titles and descriptions;
- route-specific structured data;
- raw HTML containing route H1 and core text;
- unknown route behavior;
- absence of AdSense requests while monetization is paused;
- documentation links resolving to published routes.

Manual release checks cover:

- desktop and mobile navigation;
- language selection without false `hreflang` signals;
- Search Console live URL rendering;
- Rich Results Test for the home route;
- AdSense Privacy and Messaging configuration when monetization is revisited.
