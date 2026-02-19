import requests

def generate_skills_llm(company: str, role: str):
    """
    Generate required skills using local Ollama LLM (Mistral).
    """

    prompt = f"""
    You are a hiring manager.

    List the top 15 technical skills required for a {role} at {company}.
    Return only a comma separated list of skills.
    Do not explain anything.
    """

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        result = response.json().get("response", "")

        skills = [s.strip().lower() for s in result.split(",") if len(s.strip()) > 1]

        return skills[:15]

    except Exception as e:
        print("LLM fallback failed:", e)
        return []