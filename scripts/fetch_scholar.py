#!/usr/bin/env python3
"""Fetch publications and write _data/publications.yml + _data/coauthors.yml.

Primary source: Semantic Scholar Graph API (full author names + IDs, no JS,
no scraping, deterministic ordering). Google Scholar HTML is kept as a
fallback only — it returns abbreviated initials so it cannot satisfy v2.

Per paper we emit a list of author objects with full name, profile URL, and
an `is_self` flag. New coauthor IDs are looked up once and cached in
_data/coauthors.yml so subsequent runs do not re-fetch (and stay under the
SS rate limit).

Run: python scripts/fetch_scholar.py
Override IDs via env: SCHOLAR_ID, SEMANTIC_SCHOLAR_AUTHOR_ID.
"""
from __future__ import annotations

import argparse
import html
import json as _json
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import yaml

DEFAULT_GS_ID = "3cHbgQQAAAAJ"
DEFAULT_SS_ID = "2000315380"
ROOT = Path(__file__).resolve().parent.parent
PUBS_PATH = ROOT / "_data" / "publications.yml"
COAUTHORS_PATH = ROOT / "_data" / "coauthors.yml"
VENUE_OVERRIDES_PATH = ROOT / "_data" / "venue_overrides.yml"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _http_get(url: str, retries: int = 4, backoff: float = 2.0) -> str:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en"})
            with urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except HTTPError as e:
            last_err = e
            sleep_for = backoff * (attempt + 1)
            if e.code == 429:
                sleep_for = max(sleep_for, 5.0 * (attempt + 1))
            print(f"  ! {url[:80]}... attempt {attempt + 1}/{retries}: HTTP {e.code}", file=sys.stderr)
            time.sleep(sleep_for)
        except URLError as e:
            last_err = e
            print(f"  ! {url[:80]}... attempt {attempt + 1}/{retries}: {e}", file=sys.stderr)
            time.sleep(backoff * (attempt + 1))
    raise RuntimeError(f"all retries failed: {last_err}")


# ---------- Semantic Scholar (primary) ----------

SS_PAPERS_FIELDS = (
    "title,year,venue,publicationVenue,externalIds,url,citationCount,"
    "authors.name,authors.authorId"
)


def _arxiv_to_url(arxiv_id: str) -> str:
    return f"https://arxiv.org/abs/{arxiv_id}"


def _ss_author_url(author_id: str) -> str:
    return f"https://www.semanticscholar.org/author/{author_id}"


def _normalize_url(u: str) -> str:
    u = (u or "").strip()
    if not u:
        return ""
    if u.startswith(("http://", "https://", "//")):
        return u
    return "https://" + u


def fetch_papers(ss_id: str) -> list[dict]:
    url = (
        f"https://api.semanticscholar.org/graph/v1/author/{ss_id}/papers"
        f"?fields={SS_PAPERS_FIELDS}&limit=100"
    )
    payload = _json.loads(_http_get(url))
    return payload.get("data", [])


def enrich_coauthors(
    paper_authors: list[list[dict]], cache: dict, self_id: str, sleep_between: float = 1.2
) -> dict:
    """Look up homepage / canonical URL for each unique coauthor.

    Mutates and returns `cache` (authorId -> {name, url, homepage}).
    Skips lookups that are already cached. SS rate-limits aggressively, so we
    sleep between calls and silently fall back to the SS profile URL on 429.
    """
    seen_ids: set[str] = set()
    for authors in paper_authors:
        for a in authors:
            aid = str(a.get("authorId") or "").strip()
            if aid:
                seen_ids.add(aid)

    new_ids = sorted(seen_ids - set(cache.keys()))
    if not new_ids:
        return cache

    print(f"  enriching {len(new_ids)} new coauthor(s)...")
    for aid in new_ids:
        url = (
            f"https://api.semanticscholar.org/graph/v1/author/{aid}"
            "?fields=name,url,homepage"
        )
        try:
            data = _json.loads(_http_get(url, retries=2))
            cache[aid] = {
                "name": (data.get("name") or "").strip(),
                "homepage": _normalize_url(data.get("homepage") or "") or None,
                "url": _normalize_url(data.get("url") or _ss_author_url(aid)),
            }
        except Exception as e:  # noqa: BLE001
            print(f"    coauthor {aid} lookup failed: {e}", file=sys.stderr)
            cache[aid] = {"name": "", "homepage": None, "url": _ss_author_url(aid)}
        time.sleep(sleep_between)
    return cache


def _dedup_papers(papers: list[dict]) -> list[dict]:
    """Collapse SS records that describe the same paper.

    Two records describe the same paper when their author-ID sets are equal
    (and non-empty). From a duplicate cluster we keep the one with an arXiv
    id; otherwise the one with the most citations; otherwise the latest year.
    """
    def _key(p: dict) -> tuple:
        ids = tuple(
            sorted(
                str(a.get("authorId") or "").strip()
                for a in p.get("authors", [])
                if (a.get("authorId") or "").strip()
            )
        )
        return ids

    def _rank(p: dict) -> tuple:
        ext = p.get("externalIds") or {}
        has_arxiv = 1 if (ext.get("ArXiv") or "").strip() else 0
        citations = int(p.get("citationCount") or 0)
        year = int(p.get("year") or 0)
        return (has_arxiv, citations, year)

    clusters: dict[tuple, dict] = {}
    out: list[dict] = []
    for p in papers:
        k = _key(p)
        if not k:
            out.append(p)
            continue
        cur = clusters.get(k)
        if cur is None or _rank(p) > _rank(cur):
            clusters[k] = p
    out.extend(clusters.values())
    return out


def build_publications(papers: list[dict], coauthors: dict, venue_overrides: dict, self_id: str) -> list[dict]:
    papers = _dedup_papers(papers)
    pubs: list[dict] = []
    for p in papers:
        title = (p.get("title") or "").strip()
        if not title:
            continue

        ext = p.get("externalIds") or {}
        arxiv_id = (ext.get("ArXiv") or "").strip()

        # canonical link: arxiv if available, otherwise SS paper URL
        link = _arxiv_to_url(arxiv_id) if arxiv_id else (p.get("url") or "").strip()

        # venue: override by arxiv id, else SS venue, else publicationVenue.name
        venue = ""
        venue_year: str | None = None
        if arxiv_id and arxiv_id in venue_overrides:
            venue = venue_overrides[arxiv_id]
            m = re.search(r"\b(20\d{2})\b", venue)
            if m:
                venue_year = m.group(1)
        else:
            venue = (p.get("venue") or "").strip()
            if not venue or venue.lower() == "arxiv.org":
                pv = p.get("publicationVenue") or {}
                pv_name = (pv.get("name") or "").strip() if isinstance(pv, dict) else ""
                if pv_name and pv_name.lower() != "arxiv.org":
                    venue = pv_name
                elif arxiv_id:
                    venue = "arXiv (preprint)"

        # authors: list of {name, url, is_self}
        author_objs = []
        for a in p.get("authors", []):
            aid = str(a.get("authorId") or "").strip()
            name = (a.get("name") or "").strip()
            cached = coauthors.get(aid, {})
            if cached.get("name"):
                name = cached["name"]
            if aid:
                url_for_author = _normalize_url(
                    cached.get("homepage") or cached.get("url") or _ss_author_url(aid)
                )
            else:
                url_for_author = ""
            author_objs.append(
                {
                    "name": name,
                    "url": url_for_author,
                    "is_self": aid == self_id,
                }
            )

        pubs.append(
            {
                "title": title,
                "authors": author_objs,
                "venue": venue,
                "year": venue_year or str(p.get("year") or "").strip(),
                "url": link,
                "arxiv": arxiv_id or None,
                "citations": int(p.get("citationCount") or 0),
            }
        )

    pubs.sort(key=lambda x: (-int(x["year"] or 0), x["title"].lower()))
    return pubs


# ---------- file I/O ----------


def load_yaml(path: Path, default):
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data if data is not None else default


def write_publications(pubs: list[dict], source: str) -> None:
    PUBS_PATH.parent.mkdir(parents=True, exist_ok=True)
    header = (
        "# Auto-generated by scripts/fetch_scholar.py - do not hand-edit.\n"
        f"# Source: {source}\n"
    )
    body = yaml.safe_dump(pubs, sort_keys=False, allow_unicode=True, width=100)
    PUBS_PATH.write_text(header + body, encoding="utf-8")


def write_coauthors(cache: dict) -> None:
    COAUTHORS_PATH.parent.mkdir(parents=True, exist_ok=True)
    header = (
        "# Auto-generated by scripts/fetch_scholar.py - do not hand-edit.\n"
        "# Map: Semantic Scholar authorId -> {name, url, homepage}.\n"
    )
    ordered = {k: cache[k] for k in sorted(cache.keys())}
    body = yaml.safe_dump(ordered, sort_keys=False, allow_unicode=True, width=100)
    COAUTHORS_PATH.write_text(header + body, encoding="utf-8")


# ---------- main ----------


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--semantic-scholar-author-id",
        default=os.environ.get("SEMANTIC_SCHOLAR_AUTHOR_ID", DEFAULT_SS_ID),
    )
    ap.add_argument("--scholar-id", default=os.environ.get("SCHOLAR_ID", DEFAULT_GS_ID))
    args = ap.parse_args()

    self_id = args.semantic_scholar_author_id

    print(f"[1/3] fetching papers for SS author {self_id}...")
    papers = fetch_papers(self_id)
    if not papers:
        print("  no papers returned; leaving existing files unchanged.", file=sys.stderr)
        return 0
    print(f"  got {len(papers)} papers.")

    print("[2/3] enriching coauthors (homepage / canonical URL)...")
    coauthors = load_yaml(COAUTHORS_PATH, {}) or {}
    coauthors = enrich_coauthors(
        [p.get("authors", []) for p in papers], coauthors, self_id
    )
    write_coauthors(coauthors)

    print("[3/3] building publications.yml...")
    overrides = load_yaml(VENUE_OVERRIDES_PATH, {}) or {}
    pubs = build_publications(papers, coauthors, overrides, self_id)
    write_publications(pubs, f"Semantic Scholar (id={self_id})")
    print(f"Wrote {len(pubs)} publications and {len(coauthors)} coauthors.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
