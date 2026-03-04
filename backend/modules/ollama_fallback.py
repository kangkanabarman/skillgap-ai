"""
Ollama Local LLM Fallback
Uses local Ollama model (e.g., llama3)
"""

import requests


OLLAMA_URL = "http://localhost:11434/api/generate"


def generate_skills_ollama(company: str, role: str):
    """
    Generate job skills using local Ollama model.
    Requires Ollama running locally.
    """

    prompt = f"""
    You are a job skills extractor.

    Company: {company}
    Role: {role}

    Return only a comma-separated list of required technical skills.
    No explanation. Only skills.
    """

    payload = {
        "model": "llama3",   # change if using different model
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()

        text = data.get("response", "")
        print("RAW OLLAMA RESPONSE:", text)

        skills = []

# Replace newlines with commas to handle list formats
        normalized = text.replace("\n", ",")

        for item in normalized.split(","):
            clean = item.strip("-• 0123456789. ").strip()
            if clean:
                skills.append(clean)

        print("PARSED SKILLS:", skills)

        return skills

    except Exception as e:
        print("Ollama failed:", e)
        return []