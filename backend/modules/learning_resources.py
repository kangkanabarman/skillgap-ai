"""
Module 1 Step 5: Recommend Learning Resources
Uses FREE sources: YouTube API, FreeCodeCamp, Coursera (scraping), curated links
"""

import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Curated FREE learning resources by skill (no API needed for fallback)
SKILL_RESOURCES = {
    "python": [
        {"platform": "FreeCodeCamp", "title": "Python for Everybody", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "type": "course"},
        {"platform": "YouTube", "title": "Python Full Course", "url": "https://www.youtube.com/results?search_query=python+full+course+free", "type": "video"},
    ],
    "javascript": [
        {"platform": "FreeCodeCamp", "title": "JavaScript Algorithms and Data Structures", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "type": "course"},
        {"platform": "YouTube", "title": "JavaScript Tutorial", "url": "https://www.youtube.com/results?search_query=javascript+full+course+free", "type": "video"},
    ],
    "react": [
        {"platform": "FreeCodeCamp", "title": "React and Redux", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/", "type": "course"},
        {"platform": "YouTube", "title": "React Full Course", "url": "https://www.youtube.com/results?search_query=react+full+course+free", "type": "video"},
    ],
    "machine learning": [
        {"platform": "Coursera", "title": "Machine Learning (Andrew Ng)", "url": "https://www.coursera.org/learn/machine-learning", "type": "course"},
        {"platform": "YouTube", "title": "ML Full Course", "url": "https://www.youtube.com/results?search_query=machine+learning+full+course+free", "type": "video"},
    ],
    "data structures": [
        {"platform": "FreeCodeCamp", "title": "Data Structures", "url": "https://www.freecodecamp.org/learn/coding-interview-prep/data-structures/", "type": "course"},
        {"platform": "YouTube", "title": "DSA Full Course", "url": "https://www.youtube.com/results?search_query=data+structures+algorithms+full+course", "type": "video"},
    ],
    "algorithms": [
        {"platform": "FreeCodeCamp", "title": "Algorithms", "url": "https://www.freecodecamp.org/learn/coding-interview-prep/algorithms/", "type": "course"},
    ],
    "aws": [
        {"platform": "YouTube", "title": "AWS Tutorial", "url": "https://www.youtube.com/results?search_query=aws+tutorial+free+full+course", "type": "video"},
    ],
    "docker": [
        {"platform": "YouTube", "title": "Docker Tutorial", "url": "https://www.youtube.com/results?search_query=docker+tutorial+free", "type": "video"},
    ],
    "kubernetes": [
        {"platform": "YouTube", "title": "Kubernetes Tutorial", "url": "https://www.youtube.com/results?search_query=kubernetes+tutorial+free", "type": "video"},
    ],
    "sql": [
        {"platform": "FreeCodeCamp", "title": "Relational Database", "url": "https://www.freecodecamp.org/learn/relational-database/", "type": "course"},
    ],
    "system design": [
        {"platform": "YouTube", "title": "System Design", "url": "https://www.youtube.com/results?search_query=system+design+interview", "type": "video"},
    ],
    "git": [
        {"platform": "YouTube", "title": "Git Tutorial", "url": "https://www.youtube.com/results?search_query=git+tutorial+free", "type": "video"},
    ],
}

# Default fallback for unknown skills
DEFAULT_RESOURCES = [
    {"platform": "FreeCodeCamp", "title": "Free Coding Courses", "url": "https://www.freecodecamp.org/learn/", "type": "course"},
    {"platform": "Coursera", "title": "Free Courses", "url": "https://www.coursera.org/courses?query=free", "type": "course"},
    {"platform": "YouTube", "title": "Search Tutorials", "url": "https://www.youtube.com/results?search_query=programming+tutorial+free", "type": "video"},
]


def get_resources_for_skill(skill: str) -> List[Dict[str, Any]]:
    """Get curated learning resources for a skill."""
    skill_lower = skill.lower().strip()
    if skill_lower in SKILL_RESOURCES:
        return SKILL_RESOURCES[skill_lower].copy()
    return DEFAULT_RESOURCES.copy()


def get_learning_resources(missing_skills: List[str]) -> Dict[str, List[Dict[str, Any]]]:
    """Get resources for each missing skill."""
    result = {}
    for skill in missing_skills:
        result[skill] = get_resources_for_skill(skill)
    return result


async def fetch_youtube_videos(skill: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """Fetch YouTube videos for skill using YouTube Data API v3 (free 10k quota/day)."""
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        return []

    try:
        from googleapiclient.discovery import build
        youtube = build("youtube", "v3", developerKey=api_key)
        req = youtube.search().list(
            part="snippet",
            q=f"{skill} tutorial programming",
            type="video",
            maxResults=max_results,
            relevanceLanguage="en",
        )
        resp = req.execute()
        items = resp.get("items", [])
        return [
            {
                "platform": "YouTube",
                "title": i["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={i['id']['videoId']}",
                "type": "video",
                "thumbnail": i["snippet"].get("thumbnails", {}).get("default", {}).get("url"),
            }
            for i in items if i.get("id", {}).get("videoId")
        ]
    except Exception as e:
        logger.warning("YouTube API error: %s", e)
        return []


def build_rule_based_roadmap(missing_skills: List[str], role: str) -> str:
    """
    Build a learning roadmap WITHOUT LLM - rule-based, specific resources.
    """
    if not missing_skills:
        return "You have all the required skills! Focus on building projects and practicing system design interviews."

    lines = [
        f"# Learning Roadmap for {role}",
        "",
        "## Skills to Learn",
        "",
    ]
    for i, skill in enumerate(missing_skills[:10], 1):
        lines.append(f"### {i}. {skill.title()}")
        resources = get_resources_for_skill(skill)
        for r in resources[:2]:
            lines.append(f"- **{r['platform']}**: [{r['title']}]({r['url']})")
        lines.append("")

    lines.extend([
        "## Suggested Timeline",
        "- Weeks 1-2: Focus on top 2-3 missing skills",
        "- Weeks 3-4: Build a project using those skills",
        "- Week 5+: Practice interview questions and system design",
        "",
        "## Tips",
        "- Use FreeCodeCamp and Coursera free tiers",
        "- Build portfolio projects to demonstrate skills",
        "- Practice on LeetCode for DSA",
    ])
    return "\n".join(lines)
