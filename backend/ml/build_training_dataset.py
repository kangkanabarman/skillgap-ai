import pandas as pd

# Load datasets
postings = pd.read_csv("ml/raw_data/postings.csv", low_memory=False)
job_skills = pd.read_csv("ml/raw_data/jobs/job_skills.csv", low_memory=False)
companies = pd.read_csv("ml/raw_data/companies/companies.csv", low_memory=False)

# Keep important columns only
postings = postings[[
    "job_id",
    "company_name",
    "title",
    "description"
]]

job_skills = job_skills[[
    "job_id",
    "skill_name"
]]

# Merge skills into postings
merged = postings.merge(job_skills, on="job_id", how="left")

# Group skills per job
final = merged.groupby(
    ["job_id", "company_name", "title", "description"]
)["skill_name"].apply(list).reset_index()

# Remove rows without description
final = final.dropna(subset=["description"])

# Save cleaned dataset
final.to_csv("ml/training_dataset.csv", index=False)

print("Training dataset created successfully!")
print("Total rows:", len(final))