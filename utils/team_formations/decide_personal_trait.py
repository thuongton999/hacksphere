import numpy as np
import pandas as pd

# TIPI scoring: reverse-score items 2,4,6,8,10
TIPI_REVERSED = {2, 4, 6, 8, 10}

def reverse_score(x, min_val=1, max_val=7):
    return (max_val + min_val) - x

def score_tipi(df):
    # Expect columns TIPI1..TIPI10 (1–7)
    for i in range(1, 11):
        col = f"TIPI{i}"
        if col not in df.columns:
            raise ValueError(f"Missing TIPI column: {col}")
    scored = df[[f"TIPI{i}" for i in range(1, 11)]].astype(float).copy()
    for i in TIPI_REVERSED:
        col = f"TIPI{i}"
        scored[col] = scored[col].apply(reverse_score)

    # Big Five (average the two relevant items)
    big5 = pd.DataFrame(index=df.index)
    big5["Extraversion"] = (scored["TIPI1"] + scored["TIPI6"]) / 2
    big5["Agreeableness"] = (scored["TIPI2"] + scored["TIPI7"]) / 2
    big5["Conscientiousness"] = (scored["TIPI3"] + scored["TIPI8"]) / 2
    big5["EmotionalStability"] = (scored["TIPI4"] + scored["TIPI9"]) / 2  # higher = more stable
    big5["Openness"] = (scored["TIPI5"] + scored["TIPI10"]) / 2
    return big5

def assign_personality_label(big5: pd.DataFrame) -> pd.Series:
    # Compute z-scores within the intake cohort for relative comparisons
    z = (big5 - big5.mean()) / (big5.std(ddof=0) + 1e-6)

    labels = []
    for i in big5.index:
        ez, az, cz, sz, oz = z.loc[i, ["Extraversion","Agreeableness","Conscientiousness","EmotionalStability","Openness"]]

        # Priority rules (tune thresholds as needed, e.g., 0.4–0.6)
        if ez > 0.6 and cz > 0.3:
            labels.append("Leader")
        elif oz > 0.6:
            labels.append("Creative")
        elif cz > 0.6 and ez < 0.2:
            labels.append("Analytical")
        elif az > 0.5:
            labels.append("Collaborative")
        else:
            # Fallback: pick the max of selected anchors
            anchors = {
                "Leader": float(ez + 0.3*cz),
                "Creative": float(oz),
                "Analytical": float(cz - 0.2*ez),
                "Collaborative": float(az),
            }
            labels.append(max(anchors, key=anchors.get))
    return pd.Series(labels, index=big5.index, name="PersonalityTrait")

def ensure_personality_trait(df: pd.DataFrame) -> pd.DataFrame:
    # If the CSV already has PersonalityTrait, keep it; else compute from TIPI
    if "PersonalityTrait" in df.columns and df["PersonalityTrait"].notna().any():
        return df
    big5 = score_tipi(df)
    df = df.copy()
    df["PersonalityTrait"] = assign_personality_label(big5)
    return df

# Load contestants CSV → df
df = pd.read_csv("contestants.csv")

# If not already present, compute PersonalityTrait from TIPI responses in the CSV
df = ensure_personality_trait(df)

# Save back so `team_formations.py` can proceed as-is
df.to_csv("contestants.csv", index=False)