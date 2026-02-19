import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
df = pd.read_csv("ml/role_dataset.csv")

X = df["text"]
y = df["label"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Vectorizer
vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1,2)
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Model
model = LogisticRegression(max_iter=1000)
model.fit(X_train_vec, y_train)

# Evaluate
preds = model.predict(X_test_vec)
print("Accuracy:", accuracy_score(y_test, preds))

# Save
joblib.dump(model, "ml/role_model.pkl")
joblib.dump(vectorizer, "ml/role_vectorizer.pkl")

print("Model saved successfully.")