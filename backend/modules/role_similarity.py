from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# Define role profiles
ROLE_PROFILES = {
    "backend": """
    Backend development, APIs, databases, microservices, system design,
    server-side logic, REST APIs, Django, Flask, Node.js, Java, SQL
    """,

    "frontend": """
    Frontend development, UI design, React, Angular, CSS, HTML,
    JavaScript, user interfaces, responsive design
    """,

    "data": """
    Data science, machine learning, Python, pandas, numpy,
    deep learning, statistics, data analysis, AI models
    """,

    "product": """
    Product management, roadmap planning, stakeholder communication,
    metrics, business strategy, growth, user research
    """
}

# Precompute embeddings
role_embeddings = {
    role: model.encode(text)
    for role, text in ROLE_PROFILES.items()
}


def predict_role_from_text(job_text: str):
    job_embedding = model.encode(job_text)

    scores = {}
    for role, emb in role_embeddings.items():
        similarity = cosine_similarity(
            [job_embedding],
            [emb]
        )[0][0]
        scores[role] = float(similarity)

    best_role = max(scores, key=scores.get)

    return {
        "predicted_role": best_role,
        "confidence": scores[best_role],
        "all_scores": scores
    }