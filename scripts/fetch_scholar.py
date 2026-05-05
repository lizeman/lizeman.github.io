#!/usr/bin/env python3
"""Fetch publications and write _data/publications.yml.

Strategy: scrape Google Scholar profile HTML directly (fast, no JS,
no Selenium), and fall back to the Semantic Scholar Graph API if
Google Scholar blocks or returns nothing. Both paths use stdlib HTTP
plus PyYAML — no `scholarly`, no `requests`, no `bs4` required.

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
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "_data" / "publications.yml"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _http_get(url: str, retries: int = 3, backoff: float = 5.0) -> str:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en"})
            with urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except (HTTPError, URLError) as e:
            last_err = e
            print(f"  ! {url[:60]}... attempt {attempt + 1}/{retries}: {e}", file=sys.stderr)
            time.sleep(backoff * (attempt + 1))
    raise RuntimeError(f"all retries failed: {last_err}")


# ---------- Google Scholar (HTML scrape) ----------

# Two-stage parse: first split into rows, then extract fields within
# each row. This avoids non-greedy `.*?` matches walking across rows.
GS_ROW_BLOCK = re.compile(r'<tr class="gsc_a_tr">(.*?)</tr>', re.DOTALL)
GS_TITLE = re.compile(r'<a href="([^"]+)" class="gsc_a_at">([^<]+)</a>')
GS_GRAY = re.compile(r'<div class="gs_gray">(.*?)</div>', re.DOTALL)
GS_STRIP_TAGS = re.compile(r"<[^>]+>")
GS_YEAR = re.compile(r'<span class="gsc_a_h[^"]*">([0-9]+)</span>')
GS_CITES = re.compile(r'class="gsc_a_ac[^"]*"[^>]*>([0-9]+)</a>')


def fetch_google_scholar(scholar_id: str) -> list[dict]:
    url = (
        f"https://scholar.google.com/citations?user={scholar_id}"
        "&hl=en&cstart=0&pagesize=100"
    )
    page = _http_get(url)
    pubs: list[dict] = []
    for block in GS_ROW_BLOCK.findall(page):
        t = GS_TITLE.search(block)
        if not t:
            continue
        href, title = t.groups()
        grays = GS_GRAY.findall(block)
        authors = GS_STRIP_TAGS.sub("", grays[0]) if len(grays) > 0 else ""
        venue_raw = grays[1] if len(grays) > 1 else ""
        # The venue cell often ends with "<span class='gs_oph'>, 2025</span>";
        # strip all inner tags then trailing ", year" suffix.
        venue = GS_STRIP_TAGS.sub("", venue_raw)
        venue = re.sub(r",\s*\d{4}\s*$", "", venue).strip()
        year_m = GS_YEAR.search(block)
        year = year_m.group(1) if year_m else ""
        cites_m = GS_CITES.search(block)
        cites = int(cites_m.group(1)) if cites_m else 0
        link = (
            "https://scholar.google.com" + html.unescape(href)
            if href.startswith("/")
            else href
        )
        pubs.append(
            {
                "title": html.unescape(title).strip(),
                "authors": html.unescape(authors).strip(),
                "venue": html.unescape(venue).strip(),
                "year": year.strip(),
                "url": link,
                "citations": cites,
            }
        )
    return pubs


# ---------- Semantic Scholar (JSON API) ----------

SS_FIELDS = "title,authors,year,venue,externalIds,url,openAccessPdf,citationCount,publicationVenue"


def fetch_semantic_scholar(author_id: str) -> list[dict]:
    url = (
        f"https://api.semanticscholar.org/graph/v1/author/{author_id}/papers"
        f"?fields={SS_FIELDS}&limit=100"
    )
    payload = _json.loads(_http_get(url))
    raw = payload.get("data", [])
    pubs: list[dict] = []
    for p in raw:
        title = (p.get("title") or "").strip()
        if not title:
            continue
        authors = ", ".join(a.get("name", "") for a in p.get("authors", []) if a.get("name"))
        venue = (p.get("venue") or "").strip()
        if not venue:
            pv = p.get("publicationVenue") or {}
            venue = (pv.get("name") or "").strip() if isinstance(pv, dict) else ""
        ext = p.get("externalIds") or {}
        link = (
            p.get("url")
            or (p.get("openAccessPdf") or {}).get("url")
            or (f"https://arxiv.org/abs/{ext['ArXiv']}" if ext.get("ArXiv") else "")
            or (f"https://doi.org/{ext['DOI']}" if ext.get("DOI") else "")
            or ""
        )
        pubs.append(
            {
                "title": title,
                "authors": authors,
                "venue": venue,
                "year": str(p.get("year") or "").strip(),
                "url": link,
                "citations": int(p.get("citationCount") or 0),
            }
        )
    return pubs


# ---------- main ----------


def write(pubs: list[dict], source: str) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    header = (
        "# Auto-generated by scripts/fetch_scholar.py - do not hand-edit.\n"
        f"# Source: {source}\n"
    )
    body = yaml.safe_dump(pubs, sort_keys=False, allow_unicode=True, width=100)
    OUTPUT_PATH.write_text(header + body, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scholar-id", default=os.environ.get("SCHOLAR_ID", DEFAULT_GS_ID))
    ap.add_argument(
        "--semantic-scholar-author-id",
        default=os.environ.get("SEMANTIC_SCHOLAR_AUTHOR_ID", DEFAULT_SS_ID),
    )
    args = ap.parse_args()

    pubs: list[dict] = []
    source = ""

    print(f"[1/2] trying Google Scholar (id={args.scholar_id})...")
    try:
        pubs = fetch_google_scholar(args.scholar_id)
        if pubs:
            source = f"Google Scholar (id={args.scholar_id})"
        else:
            print("  Google Scholar returned 0 publications.", file=sys.stderr)
    except Exception as e:
        print(f"  Google Scholar failed: {e}", file=sys.stderr)

    if not pubs:
        print(f"[2/2] falling back to Semantic Scholar (id={args.semantic_scholar_author_id})...")
        try:
            pubs = fetch_semantic_scholar(args.semantic_scholar_author_id)
            if pubs:
                source = f"Semantic Scholar (id={args.semantic_scholar_author_id})"
        except Exception as e:
            print(f"  Semantic Scholar failed: {e}", file=sys.stderr)

    if not pubs:
        print("Both sources failed; leaving existing _data/publications.yml unchanged.", file=sys.stderr)
        return 0

    pubs.sort(key=lambda p: (-int(p["year"] or 0), p["title"].lower()))
    write(pubs, source)
    print(f"Wrote {len(pubs)} publications from {source}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
