# Comprehensive IT Skills Taxonomy (ESCO-inspired)
# Organized by category with synonyms and related terms

SKILLS_DATABASE = {
    # Programming Languages
    "python": ["python", "python3", "py", "python programming", "django", "flask", "fastapi"],
    "javascript": ["javascript", "js", "es6", "ecmascript", "node.js", "nodejs", "node"],
    "java": ["java", "java programming", "j2ee", "java ee", "spring", "spring boot"],
    "c++": ["c++", "cpp", "c plus plus"],
    "c#": ["c#", "csharp", "c sharp", ".net", "dotnet", "asp.net"],
    "typescript": ["typescript", "ts"],
    "go": ["go", "golang"],
    "rust": ["rust"],
    "ruby": ["ruby", "ruby on rails", "rails", "ror"],
    "php": ["php", "laravel"],
    "swift": ["swift", "swiftui"],
    "kotlin": ["kotlin"],
    "scala": ["scala"],
    "r": ["r", "r programming"],
    
    # Frontend Technologies
    "react": ["react", "reactjs", "react.js", "react native"],
    "angular": ["angular", "angularjs"],
    "vue": ["vue", "vuejs", "vue.js"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "sass": ["sass", "scss"],
    "tailwind": ["tailwind", "tailwindcss"],
    "bootstrap": ["bootstrap"],
    "webpack": ["webpack"],
    "redux": ["redux"],
    "next.js": ["next.js", "nextjs", "next"],
    "svelte": ["svelte"],
    
    # Backend & Frameworks
    "express": ["express", "express.js", "expressjs"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi"],
    "spring": ["spring", "spring boot"],
    "nest.js": ["nest.js", "nestjs"],
    
    # Databases
    "sql": ["sql", "structured query language"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "cassandra": ["cassandra"],
    "dynamodb": ["dynamodb"],
    "oracle": ["oracle", "oracle database"],
    "sqlite": ["sqlite"],
    "elasticsearch": ["elasticsearch", "elastic search"],
    "nosql": ["nosql", "no sql"],
    
    # Cloud & DevOps
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "gcp": ["gcp", "google cloud", "google cloud platform"],
    "docker": ["docker", "containerization"],
    "kubernetes": ["kubernetes", "k8s"],
    "ci/cd": ["ci/cd", "continuous integration", "continuous deployment"],
    "jenkins": ["jenkins"],
    "terraform": ["terraform"],
    "ansible": ["ansible"],
    "linux": ["linux", "unix"],
    "devops": ["devops", "dev ops"],
    
    # Data Science & ML
    "machine learning": ["machine learning", "ml", "scikit-learn", "sklearn"],
    "deep learning": ["deep learning", "dl", "neural networks"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch"],
    "keras": ["keras"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "data science": ["data science", "data analysis"],
    "artificial intelligence": ["artificial intelligence", "ai"],
    "nlp": ["nlp", "natural language processing"],
    "computer vision": ["computer vision", "cv", "opencv"],
    "statistics": ["statistics", "statistical analysis"],
    
    # Testing
    "testing": ["testing", "test automation"],
    "junit": ["junit"],
    "jest": ["jest"],
    "mocha": ["mocha"],
    "cypress": ["cypress"],
    "selenium": ["selenium"],
    "pytest": ["pytest"],
    
    # Version Control & Tools
    "git": ["git", "github", "gitlab", "bitbucket"],
    "jira": ["jira"],
    "agile": ["agile", "scrum"],
    "scrum": ["scrum"],
    
    # API & Architecture
    "rest api": ["rest api", "restful", "rest"],
    "graphql": ["graphql"],
    "microservices": ["microservices", "micro services"],
    "system design": ["system design", "architecture"],
    "distributed systems": ["distributed systems"],
    
    # Mobile Development
    "ios": ["ios", "ios development"],
    "android": ["android", "android development"],
    "flutter": ["flutter"],
    "react native": ["react native"],
    
    # Design
    "ui/ux": ["ui/ux", "ui", "ux", "user experience", "user interface"],
    "figma": ["figma"],
    "sketch": ["sketch"],
    "adobe xd": ["adobe xd", "xd"],
    "photoshop": ["photoshop"],
    
    # Soft Skills
    "problem solving": ["problem solving", "analytical"],
    "communication": ["communication"],
    "leadership": ["leadership", "team lead"],
    "teamwork": ["teamwork", "collaboration"],
    "project management": ["project management"],
    "product management": ["product management"],
    
    # Data & Analytics
    "excel": ["excel", "microsoft excel"],
    "power bi": ["power bi", "powerbi"],
    "tableau": ["tableau"],
    "data visualization": ["data visualization"],
    "etl": ["etl", "data pipeline"],
    "spark": ["spark", "apache spark"],
    "hadoop": ["hadoop"],
    
    # Other
    "algorithms": ["algorithms", "data structures"],
    "data structures": ["data structures"],
    "cybersecurity": ["cybersecurity", "security", "information security"],
    "blockchain": ["blockchain", "web3"],
}

# Flatten all skills into a searchable list
ALL_SKILLS = []
SKILL_SYNONYMS = {}

for primary_skill, synonyms in SKILLS_DATABASE.items():
    ALL_SKILLS.append(primary_skill)
    for synonym in synonyms:
        SKILL_SYNONYMS[synonym.lower()] = primary_skill

def normalize_skill(skill_text):
    """Normalize a skill to its primary form"""
    skill_lower = skill_text.lower().strip()
    return SKILL_SYNONYMS.get(skill_lower, skill_lower)

def get_all_skills():
    """Get all unique primary skills"""
    return list(SKILLS_DATABASE.keys())

def get_skill_variations(skill):
    """Get all variations/synonyms of a skill"""
    skill_normalized = normalize_skill(skill)
    return SKILLS_DATABASE.get(skill_normalized, [skill])
