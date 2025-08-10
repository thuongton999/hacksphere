## Team Formation Pipeline – Backend Integration Guide

This document explains the data flow, required Python libraries, TIPI questionnaire to collect, and how to run the provided Python code to compute `PersonalityTrait` for each contestant. It also outlines the expected inputs/outputs for integrating a team formation step into your platform.

### High-level flow
- **Intake (frontend/backend)**: Present the TIPI questionnaire and basic profile form. Save one record per contestant.
- **Personality scoring (this repo)**: Run `utils/team_formations/decide_personal_trait.py` to compute `PersonalityTrait` from TIPI responses and update the contestants table.
- **Team assignment (future/optional step)**: Use a team assignment script to create balanced teams using skills, interests, experience, and personality. Expected inputs/outputs are specified below so you can wire it in later.

## Requirements
- **Python**: 3.9+
- **Libraries**:
  - `pandas`
  - `numpy`

Install with system Python (Windows PowerShell):

```powershell
python -m pip install --user pandas numpy
```

If/when you later add team assignment, you will also need:
- `scikit-learn` (for clustering and feature encoding)

```powershell
python -m pip install --user scikit-learn
```

## Data model

### Input columns (contestants table)
- **Name**: string
- **Skills**: comma-separated string (e.g., `python,frontend`)
- **Interests**: comma-separated string (e.g., `ai,web`)
- **ExperienceLevel**: one of `Beginner | Intermediate | Expert`
- **ProjectPreference**: free text or enum (not required by personality step)
- **TIPI1..TIPI10**: integers 1–7 (Likert scale)
  - 1 = Disagree strongly, 7 = Agree strongly

### Output columns (after personality scoring)
- All input columns, plus:
- **PersonalityTrait**: one of `Analytical | Creative | Leader | Collaborative`

## TIPI questionnaire

Present the following 10 items with a 1–7 Likert scale (1 = Disagree strongly … 7 = Agree strongly). Prompt: “I see myself as:”

1. Extraverted, enthusiastic.
2. Critical, quarrelsome. (reverse-scored)
3. Dependable, self-disciplined.
4. Anxious, easily upset. (reverse-scored)
5. Open to new experiences, complex.
6. Reserved, quiet. (reverse-scored)
7. Sympathetic, warm.
8. Disorganized, careless. (reverse-scored)
9. Calm, emotionally stable.
10. Conventional, uncreative. (reverse-scored)

Store the answers as integers in columns `TIPI1` through `TIPI10`.

### Scoring rules implemented
- Reverse-score items 2, 4, 6, 8, 10 using: `reversed = 8 - original` (for 1–7 scale).
- Compute Big Five scores (average of two items each):
  - Extraversion = (TIPI1 + TIPI6R) / 2
  - Agreeableness = (TIPI2R + TIPI7) / 2
  - Conscientiousness = (TIPI3 + TIPI8R) / 2
  - EmotionalStability = (TIPI4R + TIPI9) / 2
  - Openness = (TIPI5 + TIPI10R) / 2
- Convert to cohort-relative z-scores and apply mapping to labels:
  - Leader: Extraversion z > 0.6 and Conscientiousness z > 0.3
  - Creative: Openness z > 0.6
  - Analytical: Conscientiousness z > 0.6 and Extraversion z < 0.2
  - Collaborative: Agreeableness z > 0.5
  - Fallback: argmax over anchors {Leader, Creative, Analytical, Collaborative}

You can tune thresholds per event goals (e.g., more leaders vs. more collaborators).

## Files in this folder
- `utils/team_formations/decide_personal_trait.py`: computes `PersonalityTrait` in-place for `contestants.csv`.

## How to run personality scoring

1) Ensure you have a `contestants.csv` in the project root or current working directory with the required columns (including `TIPI1..TIPI10`). Example minimal header:

```csv
Name,Skills,Interests,ExperienceLevel,ProjectPreference,TIPI1,TIPI2,TIPI3,TIPI4,TIPI5,TIPI6,TIPI7,TIPI8,TIPI9,TIPI10
```

2) Run the script (Windows PowerShell shown):

```powershell
cd utils\team_formations
python decide_personal_trait.py
```

3) Result: the script updates `contestants.csv` in-place with a new column `PersonalityTrait`.

## Integrating team assignment (optional next step)

If you add a team assignment module, we recommend the following interface for consistency:

- Input files:
  - `contestants.csv` (after personality scoring)
  - `project_config.json` with keys:
    - `num_teams` (int)
    - `team_size` (int)
    - `required_skills` (list[str])
    - `preferred_interests` (list[str])

- Outputs:
  - `contestants_with_groups.csv`: same rows as `contestants.csv` plus `Group` (int)
  - `team_feedback.csv`: two columns `Name,Group` for auditing/feedback loops

- Suggested algorithmic considerations:
  - Normalize `Skills` and `Interests` as lists (trim spaces, drop empties)
  - Balance by skills match (required), interests match (preferred), experience dispersion, and personality diversity
  - Use clustering (e.g., KMeans) as a first pass, then refine by combinatorial scoring within clusters

## Backend integration notes
- Prefer writing submissions directly to your database; generate `contestants.csv` for batch scoring if needed.
- Run `decide_personal_trait.py` as a batch job after registration cut-off, or compute labels synchronously on submission and store to DB.
- Keep the mapping thresholds in a config so they can be tuned per event without code changes.

## Troubleshooting
- “Missing TIPI column”: ensure all `TIPI1..TIPI10` fields are present and numeric (1–7).
- Non-ASCII names: ensure CSV is read/written with UTF-8 encoding.
- Empty cohorts: z-score mapping requires at least a few submissions to be meaningful.


