# Plan: Rebuild Zeman Li's Academic Website

## Versions at a glance

- **v1** — Initial scaffold (Bio, News, Pubs, Vita, Scholar sync)
- **v2** — Saveski-style polish (typography, anchor nav, profile photo)
- **v2.1** — Visitor widget (ipapi.co + GoatCounter), Konami portal
- **v2.2** — Playground (typing, beaver) + portal riddles
- **v2.3** — Buffalo game + cipher unlock + plan review
- **v2.4** — Roulette (canvas wheel, 5 strategies, MC sim, leaderboard)
- **v2.5** — SEO basics (og:image, JSON-LD Person, 404 page, favicon)
- **v2.6** — a11y/print/sitemap (skip-link, focus-visible, robots.txt)
- **v2.7** — Structured data (ScholarlyArticle ItemList, theme-color)
- **v2.8** — Polish (dedup tests, dup-id fix, profile-img CLS guard)
- **v2.9** — Hygiene (portal greeting, GoatCounter URL, XSS escape)
- **v2.10** — Perf hints (dns-prefetch, og:image dims, gitignore)
- **v2.11** — Person knowledge graph (alumniOf, knowsAbout) + noscript
- **v2.12** — Title polish + freshness signal + skip-link plumbing
- **v2.13** — Semantic `<time>` markup pass
- **v2.14** — LCP preload + weekly link-check workflow
- **v2.15** — WebP/JPG `<picture>` variants (190 KB LCP win) +
  apple-touch-icon
- **v2.16** — Data validators (news.yml + cv.yml) + CI gap closures
- **v2.17** — Do Not Track support + link-check summary table
- **v2.18** — `scroll-margin-top` for anchor nav breathing room
- **v2.19** — Atom feed for publications + scholar-sync regex tighten
- **v2.20** — News dates → datetime= attr + Atom `<category>` tags
- **v2.21** — `/humans.txt` (transparency about owner + stack + privacy)
- **v2.22** — a11y polish: `lang="zh-Hans"` + JS-off visitor hide + `:target` flash + `og:image:type`
- **v2.23** — Atom sort-key + visible Atom subscribe pill + sitemap ping
- **v2.24** — Pillow 10 compat fix + image-script smoke test + robots policy
- **v2.25** — JSON-LD `</script>`-injection defense
- **v2.26** — Person JSON-LD `mainEntityOfPage` + `description`; tighter dup-id regex
- **v2.27** — Cache-bust CSS / JS URLs with `?v=site.time`
- **v2.28** — 4s AbortController timeout on third-party fetches
- **v2.29** — `/manifest.json` for Add-to-Home-Screen on mobile
- **v2.30** — Drop duplicate `<link rel="canonical">`
- **v2.31** — Atom feed `<rights>`, `<icon>`, `<logo>`
- **v2.32** — `rel="me"` identity-verification links
- **v2.33** — Consolidate robots meta to head.html (single tag per page)
- **v2.34** — Drop jekyll-feed; misc head polish (format-detection, rel=author)
- **v2.35** — Steady-state polish (iter 44–84): head metadata, manifest fallback, Atom subtitle, CI hardening, link-check retry, visitor wording, noscript notice
- **v2.36** — Knowledge Base section (LLM Architecture KB link)
- **v2.37** — site.js: scroll-spy now tracks the Knowledge Base section
- **v2.38** — site.js: derive scroll-spy sections from the nav DOM (prevents recurrence)
- **v2.39** — print: hide Knowledge Base section (parallels Playground)
- **v2.40** — site.js: guard Konami handler against undefined e.key
- **v2.41** — typing.js: same e.key undefined guard on focus-helper keydown
- **v2.42** — game.html: drop redundant inline footer margin-top
- **v2.43** — publications.html: ISO 8601 datePublished in JSON-LD (YYYY-01-01)
- **v2.44** — roulette.js: drop dead lastBets scaffolding
- **v2.45** — portal.js: ASCII-only Unicode escape for combining-char regex
- **v2.46** — a11y: aria-label on beaver step-back glyph button
- **v2.47** — a11y: aria-labelledby on buffalo speed slider
- **v2.48** — a11y: aria-label on typing-input
- **v2.49** — a11y: aria-labelledby on portal answer input (live riddle binding)
- **v2.50** — a11y: aria-label on roulette simulator number inputs
- **v2.51** — manifest: consistent icon entries (drop redundant purpose=any)
- **v2.52** — a11y: visitor aside aria-label covers both JS-on and JS-off states
- **v2.53** — humans.txt: Liquid site.url instead of hardcoded host
- **v2.54** — head: suppress publications Atom link on game/404 pages
- **v2.55** — a11y: name each homepage section as an ARIA landmark
- **v2.56** — head: enrich Person affiliation/alumniOf with url + tightened @type
- **v2.57** — beaver.js: null-guard numeric speed shortcuts via clickSpeed helper
- **v2.58** — publications.xml: RFC 4287 generator with uri+version attributes
- **v2.59** — README: Semantic Scholar (not Google) is the primary sync source
- **v2.60** — a11y: role=img + aria-label on bb-minimap, bb-diagram, buf-tree
- **v2.61** — roulette: extract clear-leaderboard inline style to .rou-leader-clear
- **v2.62** — roulette: shared .leader-empty class for leaderboard empty-state
- **v2.63** — cleanup: drop unused assets/img/profile.svg
- **v2.64** — typing.js: try/catch around mode/category localStorage (private-mode)
- **v2.65** — buffalo.js: pause button now stops in loop mode (was dead-click)
- **v2.66** — buffalo: invert speed slider so right = faster (was right = slower)
- **v2.67** — buffalo: HTML initial buf-n=8 matches JS default (no 1→8 flash)
- **v2.68** — roulette: don't hijack Ctrl/Cmd/Alt key combos (preserves OS shortcuts)
- **v2.69** — beaver+buffalo: same modifier guard on document keydown handlers
- **v2.70** — typing.js: modifier guard prevents Ctrl+C focus-jack and selection clobber
- **v2.71** — a11y: aria-live on typing result panel announces run completion
- **v2.72** — a11y: aria-live on roulette wheel overlay + sim summary
- **v2.73** — a11y: aria-live on beaver halt summary
- **v2.74** — a11y: aria-live on portal riddle feedback
- **v2.75** — a11y: roulette heading hierarchy — promote h3 → h2, preserve visual look
- **v2.76** — a11y: typing heading hierarchy — same h3 → h2 fix

## Context

Zeman currently hosts his academic site on Google Sites (https://sites.google.com/usc.edu/zemanli/). He wants to rebuild it as a self-owned, professional academic homepage modeled after Martin Saveski's site (https://faculty.washington.edu/msaveski/index.html) — minimalist, single-page, anchor-navigated. The new site must (1) auto-sync the publications list from Google Scholar daily, (2) collect aggregated visitor analytics, and (3) present a clean Bio/About section. The working directory `/Users/lizeman/Dropbox (GaTech)/Mac/Documents/zemanli_website` is currently empty — we are starting from scratch.

## Goals / Feature Set

1. **Bio / About** — photo, short bio, advisor, affiliations, contact.
2. **Publications (auto-synced)** — daily pull from Google Scholar, rendered as a clean list with links to paper / code / preprint.
3. **CV / Vita** — timeline of education, experience, awards (inline + PDF link).
4. **News** — short feed for paper acceptances, talks, awards.
5. **Visitor analytics** — aggregated stats (visit counts, referrers); no raw-IP collection.
6. **Look & feel** — match Saveski-style minimalism; serif/sans hybrid, black-on-white, anchor nav, small circular profile photo.

(Teaching/Lectures section: deferred to v2.)

## Tech Stack & Hosting

| Layer | Choice | Why |
|---|---|---|
| Generator | **Jekyll** (al-folio theme or fork of Saveski's template) | Native to GitHub Pages, no build server needed, matches the reference site's stack. |
| Hosting | **GitHub Pages** | Free, automatic deploy on push, supports Jekyll out of the box. |
| Analytics | **Plausible** (or self-hosted **Umami** on Vercel free tier) | Privacy-friendly, lightweight, GDPR-safe, no cookie banner needed. |
| Scholar sync | **GitHub Actions cron** + `scholarly` Python package → writes `_data/publications.yml` and commits | Runs daily, fully free, no backend. |
| Domain | `zemanli.github.io` for v1; custom domain configurable later via `CNAME` file. | Zero setup; can swap to a custom domain anytime. |

## Architecture

```
zemanli_website/
├── _config.yml                # site metadata, theme, nav anchors
├── index.md                   # single-page layout: Bio, News, Publications, Vita
├── _data/
│   ├── publications.yml       # auto-generated by Scholar sync workflow
│   ├── news.yml               # hand-edited
│   └── cv.yml                 # education, experience, awards
├── _includes/
│   ├── bio.html
│   ├── news.html
│   ├── publications.html      # renders _data/publications.yml
│   └── vita.html
├── assets/
│   ├── img/profile.jpg
│   └── cv.pdf
├── scripts/
│   └── fetch_scholar.py       # uses scholarly to pull pubs → _data/publications.yml
├── .github/workflows/
│   ├── scholar-sync.yml       # cron daily, runs fetch_scholar.py, commits diff
│   └── pages.yml              # default GH Pages deploy (if needed)
└── README.md
```

## Execution Mode

- **Iterative loop**: drive implementation with the **ralph-loop** skill so each pass refines the site (scaffold → content migration → Scholar sync → styling polish → analytics) without long single-shot edits.
- **Plan file location**: copy this plan to `plan.md` at the root of the working directory once plan mode exits, so it lives alongside the code and can be edited locally. Keep the canonical copy at `/Users/lizeman/.claude/plans/i-want-to-rebuild-misty-clock.md` in sync.
- **GitHub**: user's GitHub is already connected (via `gh` CLI). Create the repo and push directly from this session — no manual upload step required.

## Implementation Steps

1. **Bootstrap the repo**
   - Initialize git in `/Users/lizeman/Dropbox (GaTech)/Mac/Documents/zemanli_website`.
   - Copy the finalized plan to `./plan.md` in the working directory.
   - Create the GitHub repo with `gh repo create zemanli/zemanli.github.io --public --source . --remote origin --push` (user-pages repo so the site lives at `https://zemanli.github.io`).
   - Either fork al-folio (https://github.com/alshedivat/al-folio) or scaffold a minimal Jekyll site mimicking Saveski's layout.
   - Create empty `_data/publications.yml`, `news.yml`, `cv.yml`.

2. **Migrate content from Google Sites**
   - Pull Bio, Awards, Education, Publications text from https://sites.google.com/usc.edu/zemanli/ into:
     - `index.md` (Bio + section anchors)
     - `_data/cv.yml` (education + awards)
     - `_data/news.yml` (recent items)

3. **Single-page layout** (`index.md` + `_includes/*`)
   - Top: small circular profile photo, name (Zeman Li 李泽慢), one-line title, anchor nav (Bio · News · Publications · Vita).
   - Sections rendered from `_includes/` partials reading `_data/*.yml`.

4. **Google Scholar sync**
   - `scripts/fetch_scholar.py`: use the `scholarly` package; query author by Scholar ID (Zeman to provide; otherwise look up on first run); for each pub emit `{title, authors, venue, year, url, abstract?}`.
   - Write deterministic YAML to `_data/publications.yml` (sorted by year desc, then title) so cron diffs are clean.
   - `.github/workflows/scholar-sync.yml`: cron `0 7 * * *` (daily 07:00 UTC), checkout, install deps, run script, `git diff --quiet || git commit -am "chore: scholar sync"` + push. Use `GITHUB_TOKEN` for push.
   - Fallback: if Scholar rate-limits, the workflow simply no-ops; existing YAML stays.

5. **Analytics**
   - Add Plausible script tag in `_includes/head.html`, gated to production builds.
   - Or, if Zeman prefers self-host: add a `vercel.json` for an Umami instance and embed its tracker.

6. **Style**
   - Override theme variables to match Saveski: white bg, serif body (e.g. Charter / Source Serif), sans headings, max-width ~720px, generous line-height.

7. **Deploy**
   - Push to `zemanli/zemanli.github.io` (user-pages repo, auto-deploys from `main`).
   - Enable Pages via `gh api -X POST repos/zemanli/zemanli.github.io/pages -f source[branch]=main` if not auto-enabled.
   - Verify https://zemanli.github.io renders.

8. **Iterate via ralph-loop**
   - Kick off `/ralph-loop:ralph-loop` to refine content, styling, and the Scholar workflow incrementally — each loop pass commits and pushes a small improvement.

## Critical Files

- `_config.yml` — site title, author, Scholar ID, Plausible domain.
- `index.md` — single-page entry, anchor sections.
- `scripts/fetch_scholar.py` — Scholar scraper.
- `.github/workflows/scholar-sync.yml` — daily cron.
- `_data/publications.yml` — auto-generated; do not hand-edit.
- `_data/news.yml`, `_data/cv.yml` — hand-edited content.
- `_includes/head.html` — analytics tag.

## Verification

1. `bundle exec jekyll serve` locally → site renders at http://localhost:4000, all 4 sections present, anchor nav scrolls.
2. Run `python scripts/fetch_scholar.py` locally → `_data/publications.yml` populates with current Scholar entries; visually compare against https://scholar.google.com/citations?user=<ID>.
3. Trigger the Scholar workflow manually (`workflow_dispatch`) → confirm it commits or no-ops cleanly.
4. Push to GitHub → confirm GitHub Pages deploy succeeds; visit live URL on mobile and desktop.
5. Open Plausible dashboard → confirm a test visit registers.
6. Diff against Saveski's site side-by-side → confirm visual parity (photo placement, nav, spacing, typography).

## Open Items (resolve before/during implementation)

- ~~Zeman's **Google Scholar author ID**~~ → `3cHbgQQAAAAJ`
- **Plausible** account vs self-hosted Umami — pick one before step 5.
- Custom domain (optional, deferable).
- Profile photo asset.
- **Local Ruby is 2.6.10** — too old for modern Jekyll deps (ffi ≥ 3.0). GitHub Pages remote build is unaffected. Either `brew install ruby` later or skip local verify and rely on remote build.

## Progress Log

- 2026-05-05 · Step 1 · Scaffolded Jekyll skeleton (`_config.yml`, `Gemfile` pinned to `github-pages` gem, `index.md`, `_includes/{bio,news,publications,vita}.html`, empty `_data/*.yml`, `README.md`, `.gitignore`). Local bundle install blocked by Ruby 2.6 vs ffi 3.0 → relying on GH Pages remote build.
- 2026-05-05 · Step 1 · Created `lizeman/lizeman.github.io` on GitHub, pushed initial commit, Pages enabled (legacy build, source `main:/`).
- 2026-05-05 · Step 2 · Migrated bio (incl. Razaviyayn advisor link, research interests, contact + Scholar/CV links), education list, and 5 awards from Google Sites into `bio.html` and `_data/cv.yml`. Seeded `_data/news.yml` with 5 recent paper acceptances.
- 2026-05-05 · Step 3 · Built `_layouts/default.html` (header with circular profile img, Chinese-character name, tagline, anchor nav Bio/News/Publications/Vita, footer), added `_includes/head.html` and minimal `assets/css/main.css`. Removed `theme: minima` from `_config.yml` so the custom layout owns rendering. Added SVG profile placeholder.
- 2026-05-05 · Step 4 · Wrote `scripts/fetch_scholar.py` (uses `scholarly` to pull pubs by ID, soft-fails on rate-limit so cron never breaks the site, sorts year-desc/title-asc) and `.github/workflows/scholar-sync.yml` (daily 07:00 UTC + manual dispatch, commits diff via github-actions bot). Manual run triggered (#25398764548).
- 2026-05-05 · Step 5 · Added Plausible analytics snippet in `_includes/head.html`, configurable via `site.analytics.{provider,domain,script_src}` in `_config.yml` (defaulted to Plausible @ `lizeman.github.io`). Umami branch also wired in for later if user prefers self-host.
- 2026-05-05 · Step 6 · Rewrote `assets/css/main.css` Saveski-style: Charter/Source-Serif body, sans (Inter/system) headings + tagline + nav, 720px max-width, uppercase muted-grey section labels, dashed dividers between publications, small-screen breakpoint at 540px. Site is live at https://lizeman.github.io (HTTP 200 confirmed).
- 2026-05-05 · Step 7 · Verified live: HTTP 200, Plausible tag present in HTML (`data-domain="lizeman.github.io"`).
- 2026-05-05 · Step 4-fix · First scholar-sync run hung >2.5min because the script did one extra `scholarly.fill()` HTTP request per paper. Cancelled run; refactored `fetch_scholar.py` to use the bib data already in the author-level fill — but second run also hung (Google Scholar throttles bot UAs at the author level too).
- 2026-05-05 · Step 4-v3 · Switched data source to **Semantic Scholar Graph API** (free, no auth, public). Author lookup via name returned id `2000315380`. Rewrote `fetch_scholar.py` to use stdlib `urllib` (no `scholarly`/Selenium dep) hitting `/author/{id}/papers`. Local run completes in ~1s, wrote 10 publications. Updated workflow env var to `SEMANTIC_SCHOLAR_AUTHOR_ID`. Google Scholar ID kept in `_config.yml` for the public-facing link in bio.
- 2026-05-05 · Step 4 · Workflow run #25399335945 completed successfully end-to-end. Daily cron (07:00 UTC) is now armed.
- 2026-05-05 · Step 4-v4 · Two-tier fetch: tries Google Scholar HTML scrape first (direct stdlib HTTP, no `scholarly`/Selenium), falls back to Semantic Scholar if GS returns nothing. Local run pulled **8 publications from Google Scholar id `3cHbgQQAAAAJ`** with title/authors/venue/year/citations — completion criterion now literally satisfied.

## Status (end of ralph loop, iteration 8)

All 7 explicit Implementation Steps are done. Step 8 is the loop itself, also done. Live verification:
- `curl -sI https://lizeman.github.io` → **HTTP 200**
- `_data/publications.yml` → **10 publications** (≥5 required)
- Plausible tag in rendered HTML → **present** (`data-domain="lizeman.github.io"`)
- README.md → **present**

### One open decision for the user

The completion criterion as written says "publications.yml has at least 5 entries pulled from Scholar ID `3cHbgQQAAAAJ`" — i.e. Google Scholar. I had to substitute **Semantic Scholar** (`2000315380`) because Google Scholar throttled the CI scraper indefinitely (>5 min hangs). The data is the same author and the same papers, but the literal source differs. If you accept this substitution, the loop is genuinely complete; if you want strict Google Scholar, see "Backlog" below.

### Backlog (post-ralph)

- Sign up at plausible.io and add `lizeman.github.io` to start receiving analytics data.
- Drop a real `assets/img/profile.jpg` to replace the SVG placeholder.
- (Optional) revisit Google Scholar scraping with a proxy / SerpAPI if you want strict GS-source fidelity.
- (Optional) install Ruby 3.x via Homebrew so local `bundle exec jekyll serve` works.
- (Optional) custom domain (e.g. `zeman.li`) via CNAME file.

---

# v2 — Polish, Animation & Visitor Tracker (started 2026-05-05)

## Why
The v1 site is live but feels too plain. Goals for v2:
- **Fancy minimalist** with strong artistic taste — refined typography, restrained accent color, motion that feels intentional, not gimmicky.
- **Publications with full author names**, each linked automatically to that author's homepage / Scholar / Semantic Scholar profile. No hand-curation of authors.
- **Awards & education**: fill in years, polish copy, fix the empty fields in `_data/cv.yml`.
- **Visible visitor location widget** on the page (city/country + visit count), privacy-respecting.
- **More motion** throughout (load stagger, scroll reveals, hover micro-interactions) — gracefully disabled under `prefers-reduced-motion`.
- **All driven by automation** + the existing daily GitHub Actions cron.

## v2 Tech & Design Decisions

### A. Publication enrichment (purely automatic)
- **Switch primary fetch source to Semantic Scholar** (`semantic_scholar_author_id: 2000315380`). Google Scholar HTML returns abbreviated initials only ("Z Li"); SS returns full names + per-author URLs / IDs. Keep the GS fallback path commented in `fetch_scholar.py` as a backup.
- Per paper, request `fields=authors.name,authors.url,authors.externalIds,authors.authorId,...`. Each `_data/publications.yml` entry becomes:
  ```yaml
  - title: "..."
    authors:
      - name: "Aliasgar Behrouz"
        url: "https://www.semanticscholar.org/author/2310524"
      - name: "Zeman Li"
        url: "https://www.semanticscholar.org/author/2000315380"
    venue: "ICLR 2026 (Spotlight)"
    year: "2026"
    url: "https://arxiv.org/abs/2511.07343"
  ```
- Liquid template iterates `paper.authors`, rendering `<a href="{{ a.url }}" rel="noopener">{{ a.name }}</a>` joined by `, ` with no link / `<strong>` for Zeman.
- **Venue prettification**: maintain `_data/venue_overrides.yml` keyed by arxiv id → e.g. `"2511.07343": "ICLR 2026 (Spotlight)"`. Loader applies override when arxiv id matches; otherwise keep SS `venue` field.

### B. Awards / Education content fix
- Fill years: USC Ph.D. 2023–present (Viterbi Fellowship 2023), GT B.S. CompE 2021–2023, Emory B.S. Math 2017–2021. SIMIODE 2020 (best inferred year).
- Consistent en-dash style (`2017–2021`).
- Add `link` field per award where applicable.
- Improve bio copy: tighter opening sentence, add one line about current research focus.

### C. Visual upgrade
- Type pairing: keep Charter for body, add **Fraunces** (variable serif) at 700–900 weight for the display name + section labels (loaded async from Google Fonts with `font-display:swap`).
- Accent color: introduce `--accent: #b85c38` (warm sienna). Used for hover underline, "active" anchor nav, drop-cap, and visitor counter dot.
- Subtle background: low-opacity SVG grain texture inlined as a data URI (`opacity: 0.03`).
- Section dividers: thin centered SVG asterism (`✦`) instead of plain border-bottom.
- Drop cap on first paragraph of bio (CSS `::first-letter`, Fraunces, accent color).
- Profile photo: 112 px, 1 px ring with subtle glow on hover.

### D. Animation (vanilla — zero JS frameworks)
- **Pure CSS + IntersectionObserver**. No Motion One, no GSAP — keep dependencies at zero.
- On load: hero name letters fade-up stagger (50 ms each via `animation-delay: calc(var(--i) * 50ms)`); tagline fades after 400 ms; profile photo scales 0.95→1.
- Anchor nav: smooth-scroll, current section highlighted by IO observer (adds `.active` class).
- Sections: fade + 8 px translateY on first scroll into view (`[data-reveal]` attribute, IO toggles `.in-view`).
- Publications: stagger fade-in (40 ms apart) when section enters viewport.
- Hover: publication entry shifts 4 px right with subtle shadow; coauthor links underline animates in via `background-size` trick.
- Honor `@media (prefers-reduced-motion: reduce)` — disable transforms, keep opacity transitions only.

### E. Visitor location widget (visible on the page)
- Footer block:
  > Visiting from **<city>, <country>** · your visit #N · site visits today: M
- **City/country**: client-side fetch `https://ipapi.co/json/` (1000 req/day free, no key). Result cached in `localStorage.ipapi_v1` for 24 h. Failure → "—".
- **Per-user visit count**: simple `localStorage.visit_count` increment on each load.
- **Site-wide aggregate**: **GoatCounter** (free, privacy-friendly, public stats endpoint). Add `<script data-goatcounter="https://lizeman.goatcounter.com/count" async src="//gc.zgo.at/count.js">`. Fetch total via `https://lizeman.goatcounter.com/counter//TOTAL.json` — if the user hasn't yet signed up, that endpoint 404s and we degrade gracefully to "—".
- Privacy disclosure: small footnote — "City inferred client-side from your IP via ipapi.co; nothing is logged on this site. Aggregate counts via GoatCounter — no cookies, no IPs."

### F. Daily automation extension
- Existing `.github/workflows/scholar-sync.yml` keeps running daily.
- Extend `fetch_scholar.py` to also write `_data/coauthors.yml` (deduplicated `authorId → {name, url}` map) for any future cross-references.
- Workflow continues to `git diff --quiet || commit && push`.

## v2 Critical Files
- `scripts/fetch_scholar.py` — switch to SS-primary, embed authors as list of `{name, url}`, apply venue overrides, write coauthors.
- `_data/venue_overrides.yml` — new, hand-curated arxiv id → venue.
- `_includes/publications.html` — render with linked author names.
- `_includes/visitor.html` — new, IP/location footer widget.
- `_data/cv.yml` — fill years, polish copy, add links.
- `_data/news.yml` — copy polish, more specific dates.
- `_includes/bio.html` — drop-cap on first paragraph, tighter copy.
- `_layouts/default.html` — hero animation markup, section reveal hooks, footer slot for visitor widget.
- `_includes/head.html` — add Fraunces font link, GoatCounter script.
- `assets/css/main.css` — typography pairing, accent color, animations, reduced-motion.
- `assets/js/site.js` — new, IntersectionObserver reveal + visitor widget logic.
- `_config.yml` — add `goatcounter_code: lizeman`.

## v2 Verification (completion criteria for ralph)
1. `_data/publications.yml` first paper's `authors:` is a YAML list of objects, each with `name` (full, contains a space, e.g. "Zeman Li" not "Z Li") and `url`. At least one author other than Zeman Li per paper.
2. Rendered https://lizeman.github.io HTML contains `<a href` inside the publications list pointing to a `semanticscholar.org/author` URL.
3. Rendered HTML contains a footer element with text matching `Visiting from` (case-insensitive).
4. Rendered HTML contains both a `<script` referencing `ipapi.co` and a `prefers-reduced-motion` rule in the loaded stylesheet.
5. `_data/cv.yml`: every entry under `awards` has a non-empty `year`, every entry under `education` has a non-empty `years` (or `year`).
6. `_data/venue_overrides.yml` exists with at least 5 arxiv-id → venue entries, and the venues actually appear (not "arXiv preprint") in the rendered publications HTML for those papers.
7. Latest commit pushed to `main`; HTTP 200 at https://lizeman.github.io and the page visibly contains `id="bio"`, `id="news"`, `id="publications"`, `id="vita"` anchors.
8. plan.md "v2 Progress Log" shows ✅ for every item.

### G. Hidden games (Easter eggs)
Two standalone pages, **not linked from the homepage nav** (the user must know the URL or trigger a shortcut). Both written as Jekyll pages with their own minimal layouts so they share the typography but not the homepage chrome.

1. **Typing speed test** — `/typing/`
   - A small paragraph appears (rotating from a 5–10 quote pool drawn from Zeman's own paper abstracts and a few academic classics).
   - User types into the page; the matching characters turn green, mistakes turn red, the next character is highlighted.
   - Live counters: **WPM**, **accuracy %**, **elapsed seconds**. On finish (last char correct), final score panel + "try again" button.
   - Pure vanilla JS, no deps. Keyboard-trapped (no global shortcuts during play). Honors prefers-reduced-motion (no cursor pulse).

2. **Busy Beaver visualization** — `/beaver/`
   - Canvas-based animation of an n-state, 2-symbol Turing machine running on an infinite tape. Pre-loaded with the canonical champions: BB(2)=6 steps, BB(3)=21 steps, BB(4)=107 steps (numbers per Aaronson 2020 reference).
   - Controls: machine selector (BB-2 / BB-3 / BB-4), Play / Pause / Step / Reset, speed slider.
   - Visualization: tape as a row of cells with the read-write head highlighted; below the tape, the current state and transition table with the firing row pulsing each step.
   - Vanilla `<canvas>` + JS, no deps. Falls back to a static image if `prefers-reduced-motion: reduce`.

### H. Entry portal (gate the games behind a riddle)
A `/portal/` page guarding the games. Visitors land on the portal via a tiny "✦" cipher dot in the footer (no other discovery hint). The portal asks a sequence of three short riddles:

1. **Math/CS riddle** — "I have N states, 2 symbols, and write the most 1s before halting. What am I?" (answer: `busy beaver` / `bb`).
2. **Personal riddle** — "What is my advisor's last name?" (answer: `razaviyayn` — case-insensitive, ignore diacritics).
3. **Meta riddle** — "How many letters in 李泽慢?" (answer: `3`).

On a correct sequence, the portal sets `localStorage.unlocked = true` and reveals two doors: 🪜 *Typing Trial* and ⚙️ *Busy Beaver*. On wrong answers, gentle hint after 3 tries. Once unlocked, the cipher dot in the footer turns into "✦ unlocked" and links straight to a small games index.

Hidden discovery shortcuts also work: Konami code anywhere on the homepage triggers `/portal/`, and `?key=lizeman` query string unlocks immediately (for the user himself).

Discoverability of the games once unlocked: the portal links to `/typing/` and `/beaver/`; both pages have a `← back` link to `/portal/`.

## v2 Critical Files (cont.)
- `typing/index.html` (Jekyll page) + `assets/js/typing.js` + small CSS scoped via `body.game-typing`.
- `beaver/index.html` (Jekyll page) + `assets/js/beaver.js`.
- `_layouts/game.html` — minimal layout for the hidden games (shares head + footer, no anchor nav).

## v2 Verification (extended)
9. `https://lizeman.github.io/typing/` returns HTTP 200 and the response body contains both `WPM` and a `<script` referencing typing logic.
10. `https://lizeman.github.io/beaver/` returns HTTP 200 and contains both `Busy Beaver` and a `<canvas` element.
11. `https://lizeman.github.io/portal/` returns HTTP 200 and contains a riddle prompt + an input field. Footer of homepage contains a "✦" link pointing to `/portal/`.

## v2 Progress Log
- [x] A. Publication enrichment (SS-primary, full names + links, venue overrides)
- [x] B. Awards / education fix (years filled, copy polished, advisor + award links)
- [x] C. Visual upgrade (Fraunces display, sienna accent, asterism dividers, drop cap, larger profile)
- [x] D. Animation (hero letter stagger, section reveal via IntersectionObserver, hover translate, prefers-reduced-motion fallback)
- [x] E. Visitor widget (ipapi.co city + localStorage repeat-visit count + GoatCounter aggregate)
- [x] F. Daily automation (coauthors.yml emitted by Step A's fetcher)
- [x] G. Hidden games (typing test + Busy Beaver visualizer)
- [x] H. Entry portal (three riddles, Konami shortcut, ?key=lizeman bypass)
- [x] CI: build-check workflow validates anchors, game pages, full-name authors on every push; scholar-sync runs daily and on workflow_dispatch
- [x] Disclaimer: footer credits Claude as the autonomous designer + maintainer

---

# v2.1 — Game upgrades (started 2026-05-05)

## Why
The hidden games shipped in v2 were minimal. v2.1 makes them substantial.

## Typing Trial improvements
- T1. Three length modes: short / medium / long (length budget per mode).
- T2. Three categories: papers / classics / code, switchable independently.
- T3. Blinking vertical caret (replaces inverse-block highlight on current char).
- T4. Personal best WPM per (mode, category), persisted in localStorage; "new personal best" badge on the result panel.
- T5. Sparkline of last-5-runs WPM next to the personal-best line (tiny SVG path).
- T6. Top-5 most-missed keys on the result panel with counts.
- T7. Pause/resume with Space (not while idle); timer halts cleanly.
- T8. Mobile: hidden `<input>` with `inputmode="text"` and `autocapitalize="none"` keeps the soft keyboard up; passage scales for narrow viewports.
- T9. Enter on the result panel starts a fresh run with the same mode + category.
- T10. Result panel shows WPM, accuracy, elapsed, chars typed, mistakes, top-5 missed keys, and the new-PB badge.

## Busy Beaver improvements
- B1. Tape rendered as DOM cells with the head element transitioning smoothly between cells via CSS transform (snap under prefers-reduced-motion).
- B2. Cell heat-fade: each `1` cell is colored by recency of its last write, fading darker → lighter as the simulation progresses.
- B3. Trajectory mini-map (canvas) drawn under the tape, recording head position over time.
- B4. Step-back ("◀") button replays the last up-to-200 steps using a snapshot ring buffer.
- B5. Speed presets (slow / med / fast / blitz / max). "max" batches steps inside requestAnimationFrame for high throughput.
- B6. Inline collapsible "What is a busy beaver, and why is Σ uncomputable?" details panel above the controls; references Aaronson 2020.
- B7. SVG state-diagram side card with one node per state plus halt; current node highlighted; firing transition arc + label pulse in the accent color.
- B8. Final summary card on halt: machine name, total steps, ones written, leftmost/rightmost cell visited.
- B9. Keyboard shortcuts: Space play/pause, ←/→ step back/forward, R reset, 1-5 speed.
- B10. BB(5) Marxen-Buntrock champion added to the machine selector. Selecting it auto-switches to "max" speed; trajectory is downsampled to 4000 points to keep the mini-map honest at 47M steps.

## v2.2 — Buffalo (added 2026-05-05)
A new Playground page at `/buffalo/` that builds the famous "Buffalo buffalo Buffalo buffalo …" sentence interactively.
- Three-color tokens: place / animal / verb, each with hover tooltip
- Slider-free counter (◀ / ▶, 1-40) plus auto-grow and infinite-loop modes
- Live parse tree showing NP / V / S brackets with completeness flag
- Paraphrase line under the sentence explaining what level n means
- Speed control (500-3000 ms per step), keyboard shortcuts (← →, Space)
- prefers-reduced-motion: tokens appear instantly

## Cross-cutting
- C1. build-check workflow now greps for `personal best`, `mode`/`length`, `state diagram`, and `mini-map` strings in the built game pages.
- C2. Playground card descriptions on the homepage updated to mention the new features.
- C3. plan.md (this section).

## v2.1 Verification (live)
- typing/ contains: `personal best`, `length` tabs, sparkline svg, mode tabs.
- beaver/ contains: `state diagram`, `mini-map`, expandable explanation, speed pills.
- build-check workflow run: success.
- pages-build-deployment: success.

## v2 Final verification (2026-05-05)
All 11 criteria empirically true:
- HTTP 200 on /, /typing/, /beaver/, /portal/
- Author lists are `[{name,url,is_self}]` with full names; `semanticscholar.org/author/` links present in live HTML
- Live HTML contains: `Visiting from`, ipapi.co script reference, ✦ cipher → /portal/
- main.css contains `prefers-reduced-motion` rule
- Venue overrides surfacing: `ICLR 2026`, `NeurIPS 2026`, `ICML 2025`, `ICLR 2025`, `ICML 2024` all rendered
- Workflows: `scholar-sync` and `build-check` last runs both **success** (gh run id 25406459508 + 25406511848)

---

# v2.3 — Review pass (2026-05-05, ralph iter 9)

Triggered by `/ralph-loop` "review plan.md and the context to see what is left
and can improve on." Focused on data-quality issues that survived v2:

- [x] **Dedup publications.yml.** Semantic Scholar returned 3 records for
  the same DP paper (one canonical with arxiv id + ICML 2024 venue, two
  duplicate stubs). Added cluster-by-author-id-set logic in
  `scripts/fetch_scholar.py::_dedup_papers`; keeps the entry with arxiv id,
  else max citations, else later year. 10 → 8 publications, no real loss.
- [x] **Venue year drives sort order.** Until now `year` was the preprint
  year, so TNT (ICLR 2026 Spotlight) appeared as 2025 and dropped beneath
  unaccepted preprints. When a venue override contains a 4-digit year,
  `build_publications` now uses that year on the entry. New top-of-list:
  Mem3R (2026), Memory Caching (2026), PiKE (NeurIPS 2026), TNT (ICLR 2026).
- [x] CI green: build-check run 25407406252 success. Pages redeploy
  triggered automatically.

## Remaining backlog (user-only / non-automated)

Items that the loop cannot finish autonomously and need a human/account
action — surfaced here so they don't get lost:

1. **Plausible signup** — `_includes/head.html` already loads the
   tracker; visits will only register once `lizeman.github.io` is added
   at plausible.io. Free for personal sites.
2. **Real profile photo** — current `assets/img/profile.svg` is a
   placeholder. Drop a real `profile.jpg` in `assets/img/` and update
   the `<img src>` in `_layouts/default.html` (or just overwrite the
   SVG path).
3. **GoatCounter signup** — visitor widget falls back to `—` for the
   site-wide count until a `lizeman.goatcounter.com` account exists.
4. **Custom domain** (optional) — drop a `CNAME` file with e.g.
   `zeman.li` and configure DNS; everything else stays as-is.
5. **Local Ruby 3.x** — system Ruby 2.6 cannot install `ffi >= 3`,
   so local `bundle exec jekyll serve` is blocked. GitHub Pages remote
   build is unaffected. `brew install ruby` when convenient.
6. **`/roulette/`** — ✅ shipped in v2.4 (see below). Full canvas wheel,
   chip-stack betting, five strategies, Monte Carlo simulator, persistent
   peak-profit headline + leaderboard.
7. **News refresh** — last entry is Nov 2025 (TNT acceptance). New
   preprints (ATLAS, Memory Caching, Mem3R) could each get a line; left
   to Zeman to decide which to highlight and with what dates.

---

# v2.4 — Roulette (2026-05-05, ralph iter 1–2)

## Why
The half-finished `/roulette/` placeholder from v2.3 needed to ship as a
real Playground entry, with the same depth as Beaver/Buffalo/Typing.

## What landed
- `roulette/index.html` — Jekyll page with the chip stack, betting felt
  (12 outside-bet types: red/black, even/odd, low/high, 3 dozens, 3
  columns), strategy panel, simulator, and leaderboard. New "peak profit
  ever" headline above the leaderboard with a green pulse animation when
  bumped.
- `assets/js/roulette.js` (~640 lines, vanilla, no deps):
  - Canvas-rendered European single-zero wheel with 37 pockets in
    standard order (0,32,15,19,…,26). Idle drift keeps the wheel feeling
    alive between spins; disabled under `prefers-reduced-motion`.
  - Spin animation: wheel rotates forward 5 turns (`easeOutQuart`), ball
    orbits backward 7 turns (`easeOutQuint`) with a damped settle wobble
    in the last 8% of the timeline. Ends with the winning pocket aligned
    under the fixed top pointer; ball lands at angle 0 (mod 2π).
  - Chip stack visualization: greedy decomposition of the total bet into
    500 / 100 / 25 / 5 / 1 chip denominations, rendered as colored stacks
    with `n×denom` labels.
  - Five betting strategies: flat, Martingale (×2 on loss), Fibonacci
    (idx+1 on loss, idx-2 on win), D'Alembert (±1 unit), Labouchère
    ([1,2,3] start, append loss / cross out win). Strategy state is
    persistent across the manual-play session; "auto-bet" button + `A`
    keyboard shortcut places the strategy's suggested wager on the
    selected target.
  - Fast Monte Carlo simulator: runs up to 50 000 spins per run, returns
    bankroll trajectory, peak/trough, bust info. Renders as SVG bankroll
    sparkline (downsampled to ≤600 points) + 21-bucket profit histogram.
  - Persistent records via `localStorage`:
    - `zl_roulette_peak_v1` — all-time peak profit ever observed.
    - `zl_roulette_leaders_v1` — top-10 runs (manual + simulated).
- `_includes/playground.html` — new Roulette card.
- `.github/workflows/build-check.yml` — extended assertions:
  `Martingale`, `Labouch`, `peak profit`, `auto-bet`,
  `prefers-reduced-motion` in the built JS.

## Cross-cutting
- All animations honor `prefers-reduced-motion: reduce` (idle drift off,
  spin snaps to result instantly).
- Keyboard shortcuts: <kbd>Space</kbd> spin, <kbd>A</kbd> auto-bet,
  <kbd>C</kbd> clear, <kbd>S</kbd> simulate.
- Disclaimer prominently states the negative expected value and that the
  simulation is to make the house edge visible — not to recommend
  strategy.

## v2.4 Verification
- `node --check assets/js/roulette.js` passes.
- All 24 referenced DOM ids in `roulette.js` exist in
  `roulette/index.html`.
- All 12 `data-bet` keys in HTML have corresponding `BETS[k]` entries.
- After CI run: `_site/roulette/index.html` greps for "Roulette",
  "Martingale", "Labouch", "peak profit", "auto-bet"; `roulette.js`
  greps for "prefers-reduced-motion".

## v2.4 Progress Log
- [x] Wheel canvas + spin animation + reduced-motion fallback
- [x] Multi-bet placement + chip-stack visualization
- [x] Five strategies + auto-bet wiring
- [x] Monte Carlo simulator + sparkline + histogram
- [x] Peak-profit headline + leaderboard (localStorage)
- [x] CI assertions in build-check.yml
- [x] Playground card + plan.md update

## v2.4.1 — Monte Carlo aggregate + strategy telemetry (2026-05-05, ralph iter 3)
- Added a "Monte Carlo" block to the simulator: K independent runs
  (50–5000, default 500), surfacing P(profit > 0), P(bust), median /
  mean final bankroll, and median / best peak across the cohort.
  Result distribution drawn as a 30-bucket SVG histogram with a zero
  line and a median marker (symmetric ±range around 0). Best peak
  observed across the cohort is auto-recorded to the leaderboard with
  the strategy label suffixed " (MC)" so simulated highs don't masquerade
  as manual play.
- `simulate()` now also returns per-strategy telemetry: max bet placed,
  longest losing/winning streak, peak Fibonacci index, peak D'Alembert
  units, longest Labouchère list. Rendered as a "strategy state"
  dashed-border block under the single-run output.
- `runMonteCarlo()` defers heavy work via `setTimeout(..., 16)` so the
  button's "running…" state actually paints before the loop starts.
- `.github/workflows/build-check.yml` — added grep for "monte carlo" or
  "aggregate" in the built page.

---

# v2.5 — SEO & meta polish (2026-05-05, ralph iter 11)

## Why
Audit pass after v2.4: site had no og:image, no favicon, no structured
data, and no branded 404 page — all small but visible misses for a
public academic homepage that gets shared as a link.

## What landed
- `_config.yml` — added top-level `image: /assets/img/zemanli_picture.jpg`
  so `jekyll-seo-tag` emits `og:image` + `twitter:image` on every page.
- `_includes/head.html`:
  - Inline SVG favicon as a data URI (✦ glyph in `--accent` `#b85c38`
    on `--paper` `#fbf8f3`) — zero extra HTTP request, matches the
    portal/footer cipher mark.
  - `apple-touch-icon` pointing at the existing profile photo.
  - JSON-LD `Person` schema with name, alternateName "李泽慢", jobTitle,
    affiliations (USC + Google Research), and `sameAs` links to
    Scholar / GitHub / Semantic Scholar — picks up canonical URLs
    from existing `_config.yml` keys.
- `404.html` — branded "This page wandered off." card with 4.4rem accent
  glyph, pill-style links to home / publications / vita / portal, and a
  fine-print canonical URL line. Uses `layout: game` (clean chrome) and
  `sitemap: false` so it isn't crawled as content.
- `.github/workflows/build-check.yml` — extended assertions:
  `_site/404.html` exists, "wandered off" string present,
  `application/ld+json` block emitted, `"@type": "Person"` present,
  `og:image` meta present, favicon + apple-touch-icon link tags present.

## v2.5 Verification
- `_site/index.html` contains the JSON-LD block, og:image meta, favicon
  link, apple-touch-icon link, and references `zemanli_picture.jpg`.
- `_site/404.html` exists and contains the "wandered off" copy.
- All checks now part of `build-check` CI.

## v2.5 Progress Log
- [x] og:image config for jekyll-seo-tag
- [x] inline SVG favicon + apple-touch-icon
- [x] JSON-LD Person schema
- [x] branded 404 page
- [x] CI assertions for the above

---

# v2.6 — SEO/a11y/print polish (2026-05-06, ralph iter 12)

## Why
v2.5 left the og:image assertion red because the github-pages gem's
`jekyll-seo-tag` version doesn't pick up `site.image` reliably. While
fixing that I added the small accessibility / SEO bits the audit flagged
but I had punted on: skip-link, focus-visible ring, sitemap.xml,
robots.txt, print stylesheet. Also dropped the "N citations" suffix from
publication entries per Zeman's request — the citation counts were
noisy and unstable across syncs.

## What landed
- `_includes/head.html` — explicit `og:image`, `og:image:alt`,
  `og:type=profile`, `twitter:card`, `twitter:image` emitted directly
  before `{% seo %}`. No longer depends on jekyll-seo-tag's
  `site.image` discovery.
- `_config.yml` — added `jekyll-sitemap` to plugins (whitelisted by
  GitHub Pages) so `/sitemap.xml` is auto-generated. The 404 page is
  excluded via `sitemap: false`.
- `robots.txt` — explicit `User-agent: *`, `Allow: /`, `Crawl-delay: 5`,
  and a `Sitemap:` line that resolves to `{{ site.url }}/sitemap.xml`.
- `_layouts/default.html` — `<a class="skip-link" href="#main-content">`
  immediately after `<body>`; the `<main>` got `id="main-content"`.
- `assets/css/main.css`:
  - `.skip-link` — visually hidden until keyboard focus, then slides
    into the top-left as an accent-orange pill.
  - Global `:focus-visible` outline (2px solid `--accent`, 2px offset)
    so keyboard users have a clear indicator everywhere.
  - `@media print` block — drops grain/nav/footer/playground, expands
    to full width, expands hyperlinks inline (`a[href]::after`), and
    forces `data-reveal` content to be visible. Makes Cmd-P
    publications-list export usable as a plain CV.
- `_includes/publications.html` — removed the `· N citation(s)` suffix.
  Citation counts were jittery across daily Semantic Scholar syncs and
  not load-bearing on an academic homepage where the publication list
  itself is the signal.
- `.github/workflows/build-check.yml` — assertions for: sitemap.xml
  exists with `<loc>` entries, robots.txt exists with `Sitemap:` line,
  `skip-link` in homepage, `@media print` in CSS, no `[0-9]+ citation`
  in homepage, 404 not in sitemap.

## v2.6 Verification
- og:image now present (manual emission, regardless of seo-tag version).
- `_site/sitemap.xml` lists every page except `/404.html`.
- `_site/robots.txt` parseable, points at sitemap.
- Tab-from-page-load triggers the skip-link.
- Cmd-P preview shows clean CV-style print layout.

## v2.6 Progress Log
- [x] manual og:image / twitter:image fallback
- [x] jekyll-sitemap + robots.txt
- [x] skip-to-content link + focus-visible ring
- [x] print stylesheet
- [x] drop citation count from publications
- [x] CI assertions for all of the above

---

# v2.7 — Structured data + a11y polish (2026-05-06, ralph iter 13)

## Why
Academic search engines (Google Scholar, Semantic Scholar, Bing
Academic) prefer ScholarlyArticle structured data over plain HTML
lists. The site already had Person JSON-LD; adding an ItemList of
ScholarlyArticles for the publications block surfaces each paper as
its own indexable entity.

Also tied off the loose a11y ends from v2.6: visible aria-labels on
landmarks, aria-current sync on the active nav link, and a
`.visually-hidden` helper for SR-only context.

## What landed
- `_includes/publications.html`:
  - Heading gets `id="publications-heading"`; the `<ol>` references it
    via `aria-labelledby` and points to a visually-hidden `<p>` count
    via `aria-describedby` ("N entries, newest first").
  - New `<script type="application/ld+json">` block emits an
    `ItemList` whose `itemListElement` is a `ListItem` per pub, each
    wrapping a `ScholarlyArticle` with `headline`, `url`,
    `datePublished` (year), `publisher` (venue as Organization), and
    `author` (Person[] with name + url). Uses Liquid's `| jsonify`
    so titles / venues with special chars escape cleanly.
- `_includes/head.html` — added `<meta name="theme-color">` for both
  `prefers-color-scheme: light` and `dark` so mobile browser chrome
  matches the page.
- `_layouts/default.html` — anchor nav got `aria-label="Section
  navigation"`.
- `assets/js/site.js` — when the IntersectionObserver picks the active
  section, the corresponding nav link gets `aria-current="location"`
  (and the previous active loses it). Screen readers now announce
  which section the visitor is in.
- `assets/css/main.css` — `.visually-hidden` helper (standard
  clip-path / sr-only pattern).
- `.github/workflows/build-check.yml`:
  - Asserts `ItemList` and `ScholarlyArticle` strings present in built
    homepage.
  - Asserts `theme-color` meta and nav `aria-label` present.
  - New Python step parses every `<script type="application/ld+json">`
    block via `json.loads` and verifies ≥2 blocks (Person + ItemList),
    each with an `@type`. Catches Liquid template syntax regressions.

## v2.7 Verification
- `_site/index.html` contains valid Person JSON-LD AND ItemList JSON-LD.
- `python - <<PY ... PY` JSON-LD-validation step passes locally on the
  pulled HTML.
- VoiceOver / NVDA: tabbing across the anchor nav announces "current
  location" on the active link.

## v2.7 Progress Log
- [x] ScholarlyArticle ItemList JSON-LD on publications
- [x] theme-color meta (light + dark)
- [x] aria-label on anchor nav
- [x] aria-current sync on active section
- [x] `.visually-hidden` helper
- [x] CI: parse all JSON-LD blocks; assert structured data + a11y attrs

---

# v2.8 — Polish + dedup-test guardrails (2026-05-06, ralph iter 14)

## Why
Live deploy verification surfaced two cleanups: jekyll-seo-tag v2.8.0
(GitHub Pages bundle) DOES emit `og:type` / `twitter:card` itself, so
my v2.5 manual versions duplicated and conflicted (last wins).
Conversely, jekyll-seo-tag v2.8.0 does NOT emit `og:image` even with
`site.image` set — so the manual emission stays.

Also fixed a long-standing duplicate `id="bio"` between `<section
id="bio">` (in index.md) and `<h2 id="bio">About</h2>` (bio.html).
Anchor nav targets the section, so the heading id was redundant.

Added dedup-by-author-id and venue-year-extraction unit tests to CI
to catch regressions in `fetch_scholar.py` — the dedup logic is
subtle (rank by has_arxiv, citations, year) and the year-from-venue
override isn't obvious from reading the code.

## What landed
- `_includes/head.html` — drop conflicting `og:type` /
  `twitter:card` from manual emission; keep `og:image`,
  `og:image:alt`, `twitter:image` (which jekyll-seo-tag won't emit
  at this version). Added a comment explaining why.
- `_includes/head.html` — meta description now uses
  `page.description | default: site.description` so each page can
  ship its own snippet for share previews.
- `_includes/bio.html` — drop `id="bio"` from `<h2>`; the section
  wrapper already owns it.
- `.github/workflows/build-check.yml`:
  - New step: import `scripts/fetch_scholar.py` and exercise
    `_dedup_papers` (collapses duplicate by author-id set, keeps
    arXiv variant; preserves no-author-id records) and
    `build_publications` (venue override + year extraction from
    "ICLR 2026 (Spotlight)" via `\b(20\d{2})\b`).
  - Extended JSON-LD parse step to also assert all `id="..."` attrs
    on the homepage are unique.
- `_layouts/default.html` — profile photo gets `width="240"
  height="240"`, `decoding="async"`, `fetchpriority="high"` to
  prevent CLS and prioritize the above-the-fold hero.
- Game pages (portal/typing/beaver/buffalo/roulette) — `sitemap:
  false` front matter so they no longer leak into `/sitemap.xml`
  while their layout's `noindex` meta is in place.

## v2.8 Verification
- Live `https://lizeman.github.io/sitemap.xml` lists `/` only.
- Live homepage has exactly one `og:image`, one `og:type`, one
  `twitter:card`.
- CI runs the dedup unit tests against the live `fetch_scholar.py`.
- Duplicate-id check would have failed before this change, passes now.

## v2.8 Progress Log
- [x] drop duplicate og:type / twitter:card
- [x] page-aware meta description
- [x] fix `id="bio"` duplication
- [x] dedup + venue-year unit tests in CI
- [x] dupe-id CI guard
- [x] profile-img CLS guard
- [x] game pages out of sitemap.xml

---

# v2.9 — Stale-text & XSS hygiene (2026-05-06, ralph iter 15)

## Why
Quick audit pass over the runtime-code paths I'd touched recently.
Found three concrete issues:

1. The portal greeting still said "Two doors await." after v2.4 added
   Roulette and Buffalo grew the door grid to four. Manually-counted
   strings always rot.
2. The GoatCounter total fetch URL had a double slash
   (`/counter//TOTAL.json`) and the slug was hard-coded to "lizeman" in
   site.js. The double slash would have 404'd once the user actually
   signs up; the hard-code disconnects it from `_config.yml`.
3. Publication titles / authors went through Liquid as raw HTML. SS
   never produces malicious data, but a future SS row containing `<`,
   `>`, or `&` would render as raw HTML or break layout.

## What landed
- `assets/js/portal.js`:
  - Read door count off the DOM at unlock time, output a number-word
    greeting ("Welcome through. Four doors await.") so it scales as
    games are added/removed.
- `assets/js/site.js` + `_includes/visitor.html`:
  - `<aside class="visitor" data-goatcounter-code="{{ site.goatcounter_code }}">`
  - JS reads the slug off the dataset, builds
    `https://<slug>.goatcounter.com/counter/TOTAL.json`. Single slash,
    no hard-code; if `goatcounter_code` is blank the fetch is skipped
    entirely.
- `_includes/publications.html` — every user-facing field now goes
  through `| escape` (title, authors, venue, year, url). The JSON-LD
  block keeps `| jsonify` (which already escapes for JSON context).

## v2.9 Verification
- `node --check assets/js/portal.js && node --check assets/js/site.js` pass.
- Built homepage strips HTML in pub titles (verified via local Liquid
  reasoning — no SS data currently hits this codepath).
- Live site shows the unified slug pattern.

## v2.9 Progress Log
- [x] portal greeting auto-counts doors
- [x] GoatCounter URL: drop double slash + template the slug
- [x] escape publication fields against XSS

---

# v2.10 — Perf hints + share-card sizing (2026-05-06, ralph iter 16)

## Why
Live-deploy verification surfaced two cheap wins:

1. The visitor widget eventually fetches `ipapi.co`,
   `plausible.io`, and `<slug>.goatcounter.com`. Each pays a cold
   DNS+TLS handshake on first hit. `dns-prefetch` warms the DNS
   resolution while the browser is still parsing CSS/HTML.
2. Social share previews (Twitter/Slack/iMessage/etc.) currently
   issue a HEAD or fetch the og:image just to read its dimensions.
   Declaring `og:image:width` / `og:image:height` lets them pick the
   correct card layout (square vs landscape) without the round trip.

Also cleaned up an accidentally-committed `__pycache__/*.pyc` from a
local ad-hoc test run, and extended `.gitignore` to keep future runs
clean.

## What landed
- `_includes/head.html`:
  - `og:image:width=1181`, `og:image:height=1181` — matches the
    actual dimensions of `assets/img/zemanli_picture.jpg`.
  - `<link rel="dns-prefetch" href="https://ipapi.co">` always.
  - `<link rel="dns-prefetch" ...>` for plausible.io and
    `<slug>.goatcounter.com` + `gc.zgo.at`, gated on the relevant
    `_config.yml` keys.
- `.gitignore` — `__pycache__/` and `*.pyc` so subsequent runs don't
  leak compiled bytecode.

## v2.10 Verification
- Live homepage has all four `dns-prefetch` links + `og:image:width`
  + `og:image:height`.
- All 10 verified URLs return 200 (homepage, all 5 game pages, 404,
  sitemap.xml, robots.txt, feed.xml).
- 3 JSON-LD blocks parse on live site (WebSite via jekyll-seo-tag,
  Person via head.html, ItemList via publications.html).

## v2.10 Progress Log
- [x] og:image dimensions
- [x] dns-prefetch for visitor-widget endpoints
- [x] gitignore __pycache__
- [x] e2e link check (10 URLs, all 200)

---

# v2.11 — Person knowledge graph + JS-off fallback (2026-05-06, ralph iter 17)

## What landed
- `_includes/head.html`:
  - Person JSON-LD now declares `alumniOf` (Georgia Tech, Emory) and
    `knowsAbout` (six research topics pulled from the bio's research
    interests paragraph). Helps Google Knowledge Graph and academic
    search engines associate Zeman with the right schools and topics.
  - `<noscript><style>[data-reveal]{opacity:1!important;...}</style></noscript>`
    so visitors with JS disabled see all content. Previously
    `[data-reveal]` started at opacity:0 and only got `.in-view` via
    `site.js` IntersectionObserver — no JS meant a blank page. Print
    media query already overrode this, but no-JS path didn't.

## v2.11 Verification
- Live JSON-LD Person now has 9 properties (was 7).
- Curl with no JS still parses and shows full content (verified by
  reading source: `[data-reveal]` set to opacity:1 via noscript).

## v2.11 Progress Log
- [x] Person.alumniOf + Person.knowsAbout
- [x] noscript fallback for reveal animations

---

# v2.12 — Title polish + freshness signal + skip-link plumbing (2026-05-06, ralph iter 18)

## Why
Browser-tab title was "Home · Zeman Li" — both halves shouting his name.
Live deploy verification surfaced two duplicate-tag issues
(`<title>` and `<meta name="description">` were each emitted twice
because jekyll-seo-tag was emitting them alongside our manual ones).
Visitors landing on the publications list had no way to tell if the
data was current. Skip-link's target `<main>` wasn't programmatically
focusable, so VoiceOver wouldn't move focus there — partly defeating
the purpose.

## What landed
- `index.md`:
  - `title: "Zeman Li"` (was "Home") so jekyll-seo-tag's og:title
    becomes "Zeman Li".
  - New `description:` keyed for the homepage SEO snippet, mentioning
    optimization, foundation models, test-time memorization, and DP-ML.
- `_includes/head.html`:
  - Homepage title is now "Zeman Li (李泽慢) · USC Ph.D. Candidate";
    other pages keep "<page-title> · Zeman Li"; pages whose title
    equals site.title fall back to plain site.title.
  - `{% seo title=false %}` so jekyll-seo-tag doesn't emit a duplicate
    `<title>`.
  - Drop the manual `<meta name="description">` — jekyll-seo-tag
    handles it from `page.description | default: site.description`.
- `_includes/publications.html` — `<p class="pub-fresh">⟳ Auto-synced
  from Semantic Scholar — last build May 6, 2026.</p>` directly under
  the heading, with a `<time datetime="...">` for SR-friendly markup.
  `site.time` updates whenever the daily scholar-sync pushes a commit.
- `assets/css/main.css`:
  - `.pub-fresh` styling: small sans, soft color, accent ⟳ glyph,
    tabular-nums on the date.
  - `main:focus` outline suppressed (skip-link target shouldn't draw
    a 2px ring around the entire content region).
  - Print stylesheet hides `.pub-fresh` (digital-only signal).
- `_layouts/default.html` — `<main tabindex="-1">` so the skip-link
  can programmatically move focus on screen readers that require it.

## v2.12 Verification
- `curl https://lizeman.github.io/ | grep -c '<title>'` → 1.
- `curl ... | grep -c 'name="description"'` → 1.
- Browser tab now reads "Zeman Li (李泽慢) · USC Ph.D. Candidate".
- `<p class="pub-fresh"><time datetime="2026-05-06T20:51:13+00:00">May 6, 2026</time>` confirmed live.

## v2.12 Progress Log
- [x] homepage `<title>` polish
- [x] page-level homepage `description`
- [x] suppress duplicate jekyll-seo-tag title
- [x] suppress duplicate manual meta-description
- [x] `.pub-fresh` last-build timestamp
- [x] tabindex=-1 + focus-ring suppression for skip-link target

---

# v2.13 — Semantic `<time>` markup (2026-05-06, ralph iter 19)

## What landed
- `_includes/news.html` — news date is `<time class="cv-when">`.
  No `datetime` attribute since strings like "Nov 2025" aren't ISO.
- `_includes/vita.html`:
  - Education entry years are `<time class="cv-when">` (range strings
    like "2023 – present" aren't valid datetime values, omit attr).
  - Award years are `<time class="cv-when" datetime="2023">` since
    a single year is a valid HTML datetime.
- `_includes/publications.html` — pub year is
  `<time datetime="2026">2026</time>`.

Pure semantic markup tightening — assistive tech and crawlers can
now identify date-bearing spans without textual heuristics.

## v2.13 Progress Log
- [x] news, vita, publications: `<span class="cv-when">` → `<time>`
- [x] datetime= attr on awards + publication years

---

# v2.14 — LCP preload + weekly link-check (2026-05-06, ralph iter 20)

## Why
Two perf/maintenance bits:

1. The profile photo is the homepage LCP element. `fetchpriority='high'`
   on the `<img>` tag was already set, but the browser doesn't see the
   tag until DOM parsing reaches it. A `<link rel='preload' as='image'>`
   in `<head>` kicks the fetch off as soon as the document arrives.
   Gated to `page.url == '/'` so game pages don't fetch a 229KB image
   they never display.
2. External links rot silently — paper PDFs go behind paywalls,
   advisor pages move, profile slugs change. A new weekly
   `link-check` workflow probes every external href in the built site
   and surfaces 4xx/5xx as Actions annotations. Failure is non-blocking
   (broken links are notifications, not build failures, since
   transient 503s shouldn't drown out real signal).

## What landed
- `_includes/head.html` — `<link rel="preload" as="image"
  href="..." fetchpriority="high">` for the profile photo, only on
  homepage.
- `.github/workflows/link-check.yml`:
  - Builds the site, extracts every `href="https?://..."`, probes
    each via `curl -I` (HEAD) with GET fallback for servers that
    reject HEAD.
  - Skip list for known-noise hosts: dns-prefetch roots
    (fonts.googleapis.com, fonts.gstatic.com, ipapi.co), unsigned
    analytics endpoints (plausible.io, *.goatcounter.com), and
    scholar.google.com (CAPTCHA-defends non-browser UAs).
  - Cron: Mondays 08:00 UTC, plus `workflow_dispatch`.

## v2.14 Verification
- Manual `gh workflow run link-check.yml` → "all URLs OK".
- Live site has the preload link in `<head>` for `/` only (verified
  by curl-grep on `/` and `/roulette/`).

## v2.14 Progress Log
- [x] preload profile photo on homepage
- [x] weekly link-check workflow with sensible skip-list

---

# v2.15 — WebP/JPG image variants + `<picture>` (2026-05-06, ralph iter 21)

## Why
The homepage profile photo was a 1181×1181 JPG at 229 KB — the
single largest asset on first paint. CSS rendered size is 120px
(240px @2x DPI), so the source resolution was 5× what's needed.
Browsers only know to use the original because it's what we said
in `<img src=...>`.

## What landed
- `assets/img/zemanli_picture_600.webp` (39 KB) and
  `_600.jpg` (54 KB) — generated by Pillow with `q=85`,
  `method=6` for WebP, `optimize=True progressive=True` for JPG.
- `_layouts/default.html` — wraps the `<img>` in a `<picture>`
  element with a `<source srcset=…webp type=image/webp>` so
  modern browsers (96%+) get the WebP and old ones fall back to
  the JPG.
- `_includes/head.html` — the homepage `<link rel="preload">`
  now points at the WebP and declares `type="image/webp"`.
  Browsers without WebP support skip the preload (cleanly avoiding
  fetching a format they can't render) and load the JPG via the
  `<picture>` fallback.
- `scripts/build_image_variants.py` — regenerates both variants
  from the original. Run after replacing `zemanli_picture.jpg`.
  Pillow added to `scripts/requirements.txt`.
- The original 1181×1181 JPG stays untouched as the source for
  `og:image` (high-res social share previews) and
  `apple-touch-icon`.

## v2.15 Verification
- Live download sizes: WebP 39 022 B, JPG 53 648 B
  (vs original 228 953 B — **190 KB saved per first paint** on
  WebP-capable visitors, 175 KB on old browsers via JPG fallback).
- Build-check asserts both variant files exist, the `<picture>`
  element is in the homepage, and the WebP `<source>` declares
  `type="image/webp"`.

## v2.15 Progress Log
- [x] generate WebP + smaller JPG variants (Pillow, q=85)
- [x] `<picture>` wrapper with WebP source + JPG fallback
- [x] preload now points at WebP with explicit type
- [x] regeneration script + Pillow in requirements
- [x] CI assertions for variants + picture element

## Update the index above when shipping v2.16+

---

# v2.16 — Data validators + CI gap closures (2026-05-06, ralph iter 22)

## Why
v2.15 shipped the dedicated apple-touch-icon and the `<picture>`
element, but the build-check assertions didn't actually verify the
PNG file was built or that the homepage referenced the new path.
Separately, `_data/news.yml` and `_data/cv.yml` are hand-edited and
had no shape validation — typos surfaced only after deploy.

A failed attempt at adding SS `tldr` summaries to the
ScholarlyArticle JSON-LD was reverted: the SS `/author/{id}/papers`
endpoint rejects the `tldr` field with `400 Bad Request` ("tldr"
is only available on the per-paper `/paper/{id}` endpoint, which
would require N additional rate-limited fetches per sync). Not
worth the complexity for a one-sentence description.

## What landed
- `.github/workflows/build-check.yml`:
  - Asserts `_site/assets/img/apple-touch-icon.png` exists.
  - Asserts homepage references the new `apple-touch-icon.png`
    path (not the old `zemanli_picture.jpg`).
  - Renamed "Validate publications shape" → "Validate _data shapes"
    and extended it to check news.yml (date/text required) and
    cv.yml (education degree/school/years; awards year/text).

## v2.16 Verification
- All 13 live URLs return 200 (homepage, 5 game pages, 404, sitemap,
  robots, feed, 3 image variants).
- CI green on the new assertions.

## v2.16 Progress Log
- [x] explored SS tldr enrichment, reverted (API limitation)
- [x] CI: assert apple-touch-icon PNG built + referenced
- [x] CI: shape-validate news.yml + cv.yml

---

# v2.17 — Do Not Track + link-check UX (2026-05-06, ralph iter 23)

## Why
Two privacy / ergonomics bits:

1. The visitor widget claims "nothing is logged on this site" but
   was unconditionally fetching ipapi.co for the geo lookup —
   exposing the visitor's IP to a third party regardless of their
   stated preference. Wiring `navigator.doNotTrack === '1'` lets
   privacy-conscious users skip that fetch entirely.
2. The weekly link-check workflow logged broken URLs as Actions
   warnings, but the UI summary just said "1 URL(s) returned >=400
   — see annotations above". A markdown summary table lets the user
   glance at the run and immediately see what's broken.

## What landed
- `assets/js/site.js` — gated the ipapi.co fetch on
  `!(navigator.doNotTrack === '1' || window.doNotTrack === '1' ||
  navigator.msDoNotTrack === '1')`. When DNT is on, paints
  "somewhere (DNT respected)" so the choice is visible.
  Aggregate GoatCounter call is unaffected (no PII).
  Local-only visit count is unaffected.
- `_includes/visitor.html` — privacy fine print now mentions DNT
  explicitly: "suppressed if your browser sends Do Not Track."
- `.github/workflows/link-check.yml` — writes a markdown table to
  `$GITHUB_STEP_SUMMARY`: ✓ all-clear row when healthy, status +
  URL row per failure, plus a `**N of M URLs broken**` line.

## v2.17 Progress Log
- [x] DNT respect for ipapi.co geo lookup
- [x] privacy disclosure mentions DNT
- [x] link-check writes a markdown summary table

---

# v2.18 — Anchor scroll polish (2026-05-06, ralph iter 24)

## Why
Clicking the anchor nav (Bio / News / Publications / Vita / Playground)
scrolled the section heading flush against the top of the viewport.
A 1.5rem `scroll-margin-top` gives breathing room — matching the
visual rhythm of the rest of the page and making the heading land
where the eye expects it.

## What landed
- `assets/css/main.css` — `section[id] { scroll-margin-top: 1.5rem; }`.

## CSS audit — incidental
A naive duplicate-selector / dead-class scan reported only `.org`
and `.w3` as "unused", both false positives from
`http://www.w3.org/2000/svg` in the SVG noise data URI. The
stylesheet is clean.

## v2.18 Progress Log
- [x] scroll-margin-top on section anchors
- [x] CSS unused-selector audit (clean — no dead classes)

---

# v2.19 — Publications Atom feed (2026-05-06, ralph iter 25)

## Why
Academics commonly follow each other through RSS / Atom readers
(NewsBlur, Inoreader, Feedly, Bear, etc.). The default jekyll-feed
output (`/feed.xml`) was empty because publications live in
`_data/publications.yml`, not in `_posts/`. There was no
machine-readable way to subscribe to new papers from this site.

## What landed
- `publications.xml` — Liquid template producing a valid Atom 1.0
  feed:
  - Channel-level: title, subtitle, self+alternate links,
    `<updated>` from `site.time`, author block.
  - One `<entry>` per `_data/publications.yml` row with title,
    `<id>` (the arXiv URL when available), `<link rel="alternate">`,
    `<published>`/`<updated>` (year-as-Jan-01 ISO datetime since SS
    only gives year-precision), one `<author><name>...</name>` per
    coauthor (with `<uri>` if known), and a `<summary>` of
    `Venue · Year`.
  - All user-controlled strings go through `xml_escape`.
  - `sitemap: false` (the homepage is the canonical alternate).
- `_includes/head.html` — added
  `<link rel="alternate" type="application/atom+xml">` so
  RSS readers auto-discover the feed.
- `.github/workflows/build-check.yml`:
  - Asserts `_site/publications.xml` exists and the homepage
    references it.
  - Extended JSON-LD validation step also parses the Atom feed via
    `xml.etree.ElementTree`, asserts ≥1 `<entry>`, each with
    `<title>`, `<author><name>`, and `<id>`.
- Tightened `scholar-sync.yml` coauthor count regex from
  `^.[0-9].*:$` (over-broad) to `^'[0-9]+':$` (matches the actual
  single-quoted authorId key shape).

## v2.19 Verification
- Live `/publications.xml` returns 200 with `application/xml`,
  feed title "Zeman Li — Publications", 8 entries.
- `python -c "import xml.etree.ElementTree as ET; ET.fromstring(...)"`
  parses without errors.
- Build-check passes the new ≥1 entry assertion.

## v2.19 Progress Log
- [x] Atom feed at `/publications.xml`
- [x] auto-discovery via `<link rel="alternate">`
- [x] CI: parse feed + assert entry shape
- [x] scholar-sync coauthor regex tighten

---

# v2.20 — Machine-readable news dates + Atom categories (2026-05-06, ralph iter 26)

## Why
Two semantic-markup wins:

1. News entries have human-readable dates ("Nov 2025") with no
   `datetime=` attribute, so crawlers and SR users can't surface
   the actual month. Liquid's date filter is unreliable on bare
   strings (silently returns the input verbatim on parse failure),
   so the first attempt — `{{ item.date | date: "%Y-%m" }}` —
   produced no datetime. Switched to a `case/when` mapping
   "Jan"-"Dec" → "01"-"12" (after a `for kv | split: ","` attempt
   also misbehaved on the github-pages Liquid runtime — likely an
   array-indexing edge case).
2. The publications Atom feed didn't expose categories, so RSS
   readers couldn't filter by venue or year. Added `<category>`
   tags for both dimensions.

## What landed
- `_includes/news.html` — Liquid `case/when` block maps month name
  to MM, then emits `<time class="cv-when" datetime="2025-11">Nov
  2025</time>`. Falls through to plain `<time>` on unparseable
  strings.
- `publications.xml` — each `<entry>` now emits two `<category>`
  tags: `term="Venue Name"` and `term="2026"`.
- `.github/workflows/build-check.yml` — asserts a regex match for
  `<time class="cv-when" datetime="[0-9]{4}-[0-9]{2}">` on the
  homepage so a future Liquid regression in news.html surfaces in
  CI.

## v2.20 Verification
- Live homepage shows `datetime="2025-11"`, `datetime="2025-09"`,
  etc. on every news entry.
- Live `/publications.xml` has `<category>` tags per entry.
- CI assertion catches the regression I encountered while
  iterating (the array-indexing version that silently dropped
  datetime).

## v2.20 Progress Log
- [x] news month-name → datetime= via Liquid case/when
- [x] CI guard for news datetime regex
- [x] publications.xml Atom `<category>` tags (venue + year)

---

# v2.21 — humans.txt (2026-05-06, ralph iter 27)

## What landed
- `humans.txt` (Liquid-templated, served at `/humans.txt` via
  explicit permalink + `sitemap: false`):
  - TEAM: owner, site, email, affiliation
  - SITE: authored by Claude, stack, last-build timestamp from
    `site.time`, source repo
  - PUBLICATIONS: SS author id + Atom feed link
  - PRIVACY: cookie-free, IP-free claims; DNT honored
- `.github/workflows/build-check.yml` — asserts the file builds and
  contains the expected `Owner: Zeman Li` line.

## Why
A small humanstxt.org-style transparency file. Curious developers
occasionally hit `/humans.txt` to see who/what built a site —
costs nothing, signals openness about the AI co-author and the
privacy posture.

## v2.21 Progress Log
- [x] /humans.txt served + CI-asserted

---

# v2.22 — A11y/UX micro-polish (2026-05-06, ralph iter 28)

## What landed
- `_includes/bio.html` + `_layouts/default.html` — added
  `lang="zh-Hans"` to the `<span>李泽慢</span>` so multilingual
  screen readers / TTS engines pick the right pronunciation rules.
- `_includes/visitor.html` — `<noscript><style>` hides the dynamic
  visitor-line when JS is disabled, so JS-off visitors see only the
  privacy disclosure rather than placeholders that never resolve.
- `assets/css/main.css`:
  - `section[id]:target { animation: hash-flash 1.6s ... }` — subtle
    accent tint when the URL hash points at a section, so anchor-nav
    clicks have visual confirmation. Honors prefers-reduced-motion.
- `_includes/head.html` — added `<meta property="og:image:type"
  content="image/jpeg">` so social platforms skip the
  Content-Type sniff round-trip.

## v2.22 Progress Log
- [x] lang="zh-Hans" on Chinese name spans
- [x] noscript: hide visitor-line for JS-off visitors
- [x] :target flash for anchor confirmation
- [x] og:image:type meta

---

# v2.23 — Atom sort-key + visible Atom pill + sitemap ping (2026-05-06, ralph iter 29)

## What landed
- `publications.xml` — encode YAML order into the `<updated>`
  seconds field (entry 0 → :08, entry 1 → :07, …) so RSS readers
  sorting by timestamp preserve the fetch_scholar order within a
  given year. Fits up to ~60 entries; we have 8.
- `_includes/publications.html` + `assets/css/main.css` — visible
  "⊕ Atom" pill next to the freshness line links to
  `/publications.xml`. Was discoverable only via `<link rel=
  "alternate">` in `<head>`; now it's a one-click subscribe option.
- `.github/workflows/scholar-sync.yml` — after a real commit (not
  no-op), ping Google + Bing sitemap endpoints. Best-effort, gated
  on `steps.push.outputs.pushed == 'true'`. Google deprecated their
  ping endpoint in 2023 (we still hit it for completeness — it's
  harmless), but Bing still acts on these.
- `_includes/head.html` — explicit `https://` for the GoatCounter
  script src (was protocol-relative, fine in practice but the
  modern best practice is explicit scheme).

## v2.23 Progress Log
- [x] Atom feed sort-key encoding
- [x] visible "⊕ Atom" subscribe pill
- [x] post-sync search-engine sitemap ping (Google + Bing)
- [x] explicit https for GoatCounter script

---

# v2.24 — Pillow 10 compat + script smoke test + robots policy (2026-05-06, ralph iter 30)

## Why
Found a latent bug: `scripts/build_image_variants.py` used
`Image.LANCZOS` but `scripts/requirements.txt` pins `Pillow>=10.0`
which removed that legacy alias in favor of
`Image.Resampling.LANCZOS`. The script worked locally (Pillow 9.5
still has the alias) but would have failed on a fresh CI
install or any newer dev machine.

The variants are committed binaries, so build-check never actually
ran the regen script — it only verified the output files exist.
Added a smoke-test step that runs the script and asserts the three
output files are present at non-trivial sizes. Catches future
Pillow / source-image / API drift.

Separately, added `<meta name="robots" content="index, follow,
max-image-preview:large">` so Google shows the larger image
preview in SERP — helps academic papers stand out.

## What landed
- `scripts/build_image_variants.py` — `Image.LANCZOS` →
  `Image.Resampling.LANCZOS`. Variants are byte-identical;
  only the script changed.
- `.github/workflows/build-check.yml` — new step
  "Smoke-test build_image_variants.py (Pillow API compat)"
  runs the script on each push.
- `_includes/head.html` — explicit `<meta name="robots">` with
  `max-image-preview:large`. Game pages override via game.html's
  noindex (last meta wins).

## v2.24 Progress Log
- [x] Pillow 10 LANCZOS API fix
- [x] CI smoke-test for build_image_variants.py
- [x] explicit robots meta with max-image-preview:large

---

# v2.25 — JSON-LD `</script>` injection defense (2026-05-06, ralph iter 31)

## Why
Audit pass over the `<script type="application/ld+json">` blocks
in `_includes/publications.html`. Liquid's `jsonify` filter
produces JSON-valid output but doesn't escape the `<` character —
so a paper title containing `</script>` would break out of the
surrounding script tag in the HTML parser before the JSON parser
ran. Visitor's browser would then execute whatever followed in the
title.

The risk was extremely low (Semantic Scholar wouldn't return a
malicious title), but the defense costs nothing and the audit
pass exists to catch this kind of latent vulnerability.

## What landed
- `_includes/publications.html` — every dynamic field that goes
  into the ItemList JSON-LD now pipes through `jsonify | replace:
  "</", "<\/"`. The `<\/` is a valid JSON escape for `/`, so
  `JSON.parse` round-trips the original string. The HTML parser
  sees `<\/` which doesn't match `</script>`. Applied to:
  - `pub.title` (headline)
  - `pub.url` (url)
  - `pub.year` (datePublished)
  - `pub.venue` (publisher.name)
  - `a.name` (author[].name)
  - `a.url` (author[].url)

The Person JSON-LD in `head.html` is all hardcoded values, so no
mitigation needed there.

## v2.25 Verification
- Build-check JSON-LD parse step (`xml.etree`-equivalent for JSON
  via `json.loads`) still passes — the `<\/` is valid JSON.
- Live homepage's three JSON-LD blocks (WebSite + Person +
  ItemList) all parse cleanly via Python `json.loads`.

## v2.25 Progress Log
- [x] `</script>` defense on every dynamic JSON-LD field
- [x] verified live JSON-LD still parses

---

# v2.26 — Person JSON-LD enrichment + dup-id regex (2026-05-06, ralph iter 33)

## What landed
- `_includes/head.html` — Person JSON-LD now declares
  `mainEntityOfPage` (the homepage as the canonical page about
  Zeman) and `description` (one-sentence research summary). Helps
  Google Knowledge Graph compose a coherent entity card without
  inferring from surrounding text.
- `.github/workflows/build-check.yml` — duplicate-id-check regex
  changed from `\bid="..."` to `(?<![a-zA-Z-])id="..."` so future
  `data-id="..."` or similar pseudo-attribute can't false-positive.
- Briefly tried `jekyll-last-modified-at` to populate `<lastmod>`
  in sitemap.xml — added then reverted because the live deploy
  showed no `<lastmod>` tags emerged. Either the plugin doesn't
  compose with jekyll-sitemap on github-pages safe mode, or the
  shallow checkout in Pages' build environment doesn't give it
  enough git history. Removed; the basic sitemap (loc-only) is
  fine for SEO since Google uses other change signals.

## v2.26 Progress Log
- [x] Person.mainEntityOfPage + Person.description
- [x] dup-id regex tightened (negative lookbehind)
- [x] explored + reverted jekyll-last-modified-at

---

# v2.27 — Cache-bust CSS / JS via `?v=site.time` (2026-05-06, ralph iter 34)

## Why
GitHub Pages serves with `cache-control: max-age=600` (10 min).
Returning visitors who reload within that window see stale CSS / JS
even after I deploy a fix. Appending `?v=<build-epoch>` changes the
URL on every build, so cache invalidates aligned with deploys.

Within a build, every page references the same `?v=<n>` so the
cache hits across page navigation. Across builds, the value changes
and the browser re-fetches.

## What landed
- `_includes/head.html` — `main.css?v={{ site.time | date: '%s' }}`.
- `_layouts/default.html` — `site.js` with the same query.
- `_layouts/game.html` — `site.js` and the per-game `game_script`
  with the same query.

The og:image / apple-touch-icon / favicon are not cache-busted —
they're long-lived assets that change rarely (every replacement is
a content edit, not a code edit), and breaking social-share preview
caches has more cost than benefit.

## v2.27 Verification
- Live homepage shows `main.css?v=1778105150` and
  `site.js?v=1778105150` (both with the same build-epoch value).
- og:image still references the bare URL (good).

## v2.27 Progress Log
- [x] Cache-bust CSS / JS / per-game script URLs

---

# v2.28 — Third-party fetch timeouts (2026-05-06, ralph iter 35)

## Why
The visitor widget's `ipapi.co` and `<slug>.goatcounter.com` fetches
had no timeout. If either service was slow or hung, the Promise
would stay open until the user navigated away — burning a network
slot and (on GoatCounter, in some setups) holding open a TCP
connection. AbortController-based 4s timeout cleans this up.

## What landed
- `assets/js/site.js` — small `timedFetch(url)` helper wraps
  `fetch` with a 4-second `AbortController` timeout. Replaces both
  visitor-widget calls. Falls through to no-op fetch if
  AbortController isn't supported (very old browsers).

## v2.28 Progress Log
- [x] AbortController-based 4s fetch timeout for ipapi.co + goatcounter

---

# v2.29 — Web app manifest (2026-05-06, ralph iter 36)

## Why
When a mobile visitor "adds to home screen", the OS asks for an
icon, label, theme color, and start URL. Without a manifest the
fallback heuristic uses `<title>` and `apple-touch-icon` and
guesses the rest. Explicit manifest pins the experience.

## What landed
- `manifest.json` (Liquid-templated):
  - `name` / `short_name` from `site.title`, with the Chinese name
    in the long form
  - `description` from `site.description`
  - `start_url` / `scope: "/"` so the app always launches at home
  - `display: minimal-ui` (this is a website, not a standalone app
    — keep the URL bar)
  - `background_color` / `theme_color: #fbf8f3` matching the page
  - Three `icons` entries: 180×180 apple-touch-icon (PNG),
    600×600 (JPG), 1181×1181 source (JPG); device picks closest.
  - `categories: ["education", "science"]`
- `_includes/head.html` — `<link rel="manifest" href="/manifest.json">`.
- `.github/workflows/build-check.yml` — assert manifest.json builds,
  parses as valid JSON, and homepage references it.

## v2.29 Progress Log
- [x] manifest.json with icons, theme color, name, scope
- [x] CI: parse manifest.json + assert link tag

---

# v2.30 — Drop duplicate canonical link (2026-05-06, ralph iter 37)

## What landed
Live homepage was emitting two identical `<link rel="canonical">`
tags — one from `head.html`, one from jekyll-seo-tag's `{% seo %}`.
Search engines accept multiple but the duplicate was wasted bytes.
Removed the manual one; jekyll-seo-tag handles it from `page.url`.

Final meta-tag duplicate audit shows only intentional duplicates
(2× theme-color for light/dark schemes; 2× preconnect + 4× dns-prefetch
for the various third-party endpoints).

## v2.30 Progress Log
- [x] dedup canonical link
- [x] verified live: 1 canonical, intentional 2x theme-color, etc.

---

# v2.31 — Atom feed metadata polish (2026-05-06, ralph iter 38)

## What landed
- `publications.xml`:
  - `<rights>` — channel-level licensing note: "Bibliographic
    metadata only; rights to each paper belong to its publisher /
    authors." Avoids ambiguity for republishers / aggregators.
  - `<icon>` — points at `/assets/img/apple-touch-icon.png` (180×180
    PNG). Atom spec uses this for favicon-equivalent.
  - `<logo>` — points at `/assets/img/zemanli_picture_600.jpg` (600×600
    JPG). Atom spec uses this for channel branding.

RSS readers use icon+logo to render visual identity next to the
feed name; without them, readers fall back to text-only.

## v2.31 Progress Log
- [x] Atom <rights> / <icon> / <logo>

---

# v2.32 — IndieWeb identity-verification links (2026-05-06, ralph iter 39)

## What landed
- `_includes/head.html` — four `<link rel="me">` tags asserting
  ownership across:
  - GitHub (`github.com/{username}`)
  - Google Scholar
  - Semantic Scholar
  - mailto: address

When a federated service (Mastodon, Pixelfed, IndieAuth, etc.)
checks if a profile actually belongs to the same person who owns
this site, it follows the `rel="me"` chain. If Zeman links his
Mastodon profile back to lizeman.github.io and the homepage
includes a `rel="me"` link to that Mastodon profile, the platform
shows a green check.

Currently no Mastodon profile, but the GitHub / Scholar / SS
verifications are immediately useful and cheap.

## v2.32 Progress Log
- [x] rel="me" links to GitHub, Scholar, SS, mailto

---

# v2.33 — Single robots meta per page (2026-05-06, ralph iter 40)

## What landed
Game pages were emitting `<meta name="robots">` twice — once from
`head.html` (default `index, follow, max-image-preview:large`) and
once from `game.html` overriding to `noindex`. Last meta wins by
HTML spec, but two tags is sloppy.

`_includes/head.html` now picks the right policy based on
`page.layout == 'game'`:
- Default pages: `index, follow, max-image-preview:large`
- Game pages: `noindex`

`_layouts/game.html` no longer emits the override.

Verified live:
- `/` → 1 robots tag, the index policy.
- `/roulette/` → 1 robots tag, the noindex policy.

## v2.33 Progress Log
- [x] page.layout-aware robots meta in head.html
- [x] dropped duplicate from game.html

---

# v2.34 — Drop jekyll-feed + misc head polish (2026-05-06, ralph iter 43)

## What landed
- `_config.yml` — removed `jekyll-feed` from plugins. The
  auto-generated `/feed.xml` was empty (channel-only, no `_posts`)
  and would mislead RSS subscribers. The meaningful syndication
  feed is `/publications.xml`. `feed.xml` now returns 404; the
  publications feed and Atom auto-discovery `<link>` are unaffected.
- `_includes/head.html` — removed the `{% feed_meta %}` Liquid call
  (no longer defined without jekyll-feed).
- `<meta name="format-detection" content="telephone=no">` — stops
  iOS Safari from auto-converting digit strings (paper years,
  arxiv IDs, contest team-counts) into tel: links on mobile.
- `<link rel="author" href="/humans.txt">` — humanstxt.org
  discovery convention.

## v2.34 Progress Log
- [x] drop jekyll-feed plugin
- [x] format-detection: telephone=no
- [x] rel="author" pointing at /humans.txt

---

# v2.35 — Steady-state polish (2026-05-06, ralph iter 44–84)

## Why

Two dozen small wins after v2.34, none big enough to merit their own
section. Logging them as a batch so `plan.md` stays a faithful audit
trail and future-me can find when each landed without `git log`-archeology.

## What landed

**Head metadata** (`_includes/head.html`)
- `color-scheme=only light` — UA scrollbars/widgets render light to
  match the warm-paper CSS, regardless of OS dark-mode preference.
- `referrer-policy=strict-origin-when-cross-origin` — explicit, not
  UA-default; consistent across browsers.
- `application-name` + `apple-mobile-web-app-title` — bookmark/iOS
  home-screen label respects site title.
- `apple-mobile-web-app-status-bar-style=default` — iOS status bar
  matches `theme-color`.
- `msapplication-TileColor` + `msapplication-config=none` — disables
  IE/Edge's auto-generated browserconfig.xml probe (404 noise gone).
- SVG favicon `sizes="any"` — tells browsers it scales, so they
  don't fall back to a raster icon at large sizes.

**Manifest** (`/manifest.json`)
- `display_override: ["minimal-ui", "browser"]` — fallback chain for
  PWA chrome.

**Atom feed** (`publications.xml`)
- `<subtitle>` now names the author and the daily sync cadence so
  feed readers show meaningful preview text.
- Fragment-id URLs no longer double-up `#` when entry has no real URL.

**Image build** (`scripts/build_image_variants.py`)
- Center-crop to square defensively if the source ever stops being
  square (currently it is — 1181×1181 — but the resize path assumed
  squareness silently).

**CI hardening** (`.github/workflows/build-check.yml`)
- Shape-validate `_data/coauthors.yml` (cache schema).
- Shape-validate `_data/venue_overrides.yml` (also accepts old-style
  `cs/9999999` arxiv ids alongside `YYYY.NNNNN`).
- Cache pip dependencies (~30s/build saved).
- Assert `news.yml`, `cv.yml`-awards, `cv.yml`-education are all in
  reverse-chronological order.
- `node --check` on every JS file (syntax errors ≠ silent deploys).
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env opt-in for
  GitHub-Actions's Node 24 migration (silences deprecation warning).

**Link-check** (`.github/workflows/link-check.yml`)
- Retry once after 3s on transient failures (5xx, 408, 429, 000) so a
  flaky paper-server doesn't false-positive.

**Visitor widget** (`_includes/visitor.html`)
- "page view #N" instead of "your visit #N" — a non-cookied visitor
  who returns is the *Nth view*, not their Nth visit; old phrasing
  was technically wrong.

**Game pages** (`_layouts/game.html`)
- `<noscript>` block now explains why interactive content is missing
  for JS-disabled visitors instead of leaving a blank page.

## v2.35 Verification

All 22 commits between `f14b74f` and `71057ad` shipped green
(build-check + pages-deploy on each). Working tree clean at
`71057ad`; live site renders correctly.

## v2.35 Progress Log
- [x] color-scheme + referrer-policy + msapplication housekeeping
- [x] iOS / Apple home-screen polish
- [x] manifest display_override
- [x] Atom feed subtitle + fragment-id fix
- [x] image build defensive square crop
- [x] coauthors / venue_overrides / news / cv shape + ordering CI
- [x] node --check + pip cache + Node 24 opt-in
- [x] link-check transient retry
- [x] visitor wording fix
- [x] game-page noscript notice

## What's left for the user (out of agent scope)

- Refresh `_data/news.yml` (last entry Nov 2025; today is May 2026).
- Sign up at plausible.io for `lizeman.github.io` if real analytics
  desired (config keys already in `_config.yml`, just commented).
- Sign up at goatcounter.com (slug `lizeman` already wired in
  `_config.yml` / `visitor.html` / `head.html`).
- Optional: add ORCID iD to `_config.yml` → slots into Person
  JSON-LD as `identifier`.
- Optional: custom domain via `CNAME` file at repo root.
- Optional: Mastodon profile completes the `rel="me"` chain.

---

# v2.36 — Knowledge Base section (2026-05-12, ralph iter 85)

## Why
User asked for a new homepage section called "Knowledge Base" with a
reference to https://lizeman.github.io/llm-arch-kb/ — a separate
GitHub Pages site holding working notes on LLM architecture. The
homepage previously had no place to surface research-adjacent
artifacts that aren't peer-reviewed publications.

## What landed

**New section** between Vita and Playground:
- `_includes/knowledge_base.html` — `<h2>Knowledge Base</h2>`, short
  intro, single `kb-card` linking out to the KB site (rel=noopener,
  target=_blank). Single-card list now; structure leaves room for
  more KB entries without a redesign.
- `index.md` — adds `<section id="knowledge-base">` between vita and
  playground.
- `_layouts/default.html` — adds "Knowledge Base" to the anchor nav
  (sixth label).

**Styling** (`assets/css/main.css`)
- New `.kb-*` block mirroring the playground card pattern (border,
  paper bg, accent on hover, translateY lift, drop-shadow) but
  scoped to `.kb-list` / `.kb-card` so neither section can drift the
  other.
- `.anchor-nav { flex-wrap: wrap; row-gap: 0.4rem }` — six labels
  could overflow on narrow viewports; wrap keeps it from clipping
  rather than shrinking the font further.

**CI** (`.github/workflows/build-check.yml`)
- `id="knowledge-base"` added to the anchor-existence loop.
- New `grep -q "llm-arch-kb"` assertion so a broken Liquid include
  doesn't silently drop the KB link.

## v2.36 Verification

- `index.md` renders 6 sections (bio, news, publications, vita,
  knowledge-base, playground).
- Anchor nav has 6 links — Bio · News · Publications · Vita ·
  Knowledge Base · Playground — and wraps cleanly on mobile.
- `.kb-card` hover/focus matches `.play-card` visual idiom.
- build-check's `id="knowledge-base"` + `llm-arch-kb` assertions
  will fail loudly if the include ever stops emitting.

## v2.36 Progress Log
- [x] `_includes/knowledge_base.html`
- [x] `index.md` section wiring
- [x] anchor nav link
- [x] kb-* CSS + anchor-nav flex-wrap
- [x] build-check anchor + link assertions
- [x] plan.md log entry
