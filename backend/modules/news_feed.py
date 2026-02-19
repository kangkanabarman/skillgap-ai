"""
Module 2: Real-Time Job News Feed
Uses GNews API (free 100 req/day) - https://gnews.io
"""

import os
import logging
from typing import List, Dict, Any

import httpx

logger = logging.getLogger(__name__)

GNEWS_BASE = "https://gnews.io/api/v4"
DEFAULT_QUERIES = [
    "hiring OR recruitment OR placement",
    "tech jobs India",
    "IT hiring 2025",
]


async def fetch_gnews(query: str = "hiring OR placement", lang: str = "en", country: str = "in", max_results: int = 10) -> List[Dict[str, Any]]:
    """Fetch hiring/job news from GNews API."""
    api_key = os.environ.get("GNEWS_API_KEY")
    if not api_key:
        logger.warning("GNEWS_API_KEY not set - returning empty news")
        return []

    url = f"{GNEWS_BASE}/search"
    params = {
        "q": query,
        "lang": lang,
        "country": country,
        "max": max_results,
        "token": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        logger.warning("GNews API error: %s", e)
        return []

    articles = data.get("articles", [])
    return [
        {
            "title": a.get("title", ""),
            "description": a.get("description", ""),
            "url": a.get("url", ""),
            "publishedAt": a.get("publishedAt", ""),
            "source": a.get("source", {}).get("name", "Unknown"),
        }
        for a in articles
    ]


async def get_job_news(count: int = 15) -> List[Dict[str, Any]]:
    """Aggregate job/hiring news from multiple queries."""
    all_articles = []
    seen_urls = set()

    for q in DEFAULT_QUERIES:
        articles = await fetch_gnews(query=q, max_results=5)
        for a in articles:
            url = a.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                all_articles.append(a)
                if len(all_articles) >= count:
                    break
        if len(all_articles) >= count:
            break

    return all_articles[:count]
