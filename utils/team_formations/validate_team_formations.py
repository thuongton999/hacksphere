import os
import json
import random
import pandas as pd


def generate_synthetic_dataset(num_contestants: int = 12) -> pd.DataFrame:
    random.seed(42)
    names = [f"C{i+1}" for i in range(num_contestants)]
    all_skills = [
        "python",
        "javascript",
        "design",
        "ml",
        "devops",
        "product",
        "data",
        "frontend",
        "backend",
        "ux",
        "ai",
        "cloud",
    ]
    all_interests = ["web", "ai", "health", "finance", "gaming", "education"]
    experience_levels = ["Beginner", "Intermediate", "Expert"]
    personalities = ["Analytical", "Creative", "Leader", "Collaborative"]

    rows = []
    for i in range(num_contestants):
        skills = ",".join(sorted(random.sample(all_skills, k=random.choice([2, 3]))))
        interests = ",".join(sorted(random.sample(all_interests, k=random.choice([1, 2]))))
        experience = experience_levels[(i // 4) % len(experience_levels)]
        personality = personalities[i % len(personalities)]
        rows.append(
            {
                "Name": names[i],
                "Skills": skills,
                "Interests": interests,
                "ExperienceLevel": experience,
                "ProjectPreference": "General",
                "PersonalityTrait": personality,
            }
        )

    return pd.DataFrame(rows)


def write_inputs(df: pd.DataFrame, base_dir: str) -> None:
    contestants_csv = os.path.join(base_dir, "contestants.csv")
    config_json = os.path.join(base_dir, "project_config.json")

    df.to_csv(contestants_csv, index=False)

    config = {
        "num_teams": 3,
        "team_size": 4,
        "required_skills": ["python", "frontend", "design", "ml"],
        "preferred_interests": ["ai", "web"],
    }
    with open(config_json, "w", encoding="utf-8") as f:
        json.dump(config, f)


def validate_outputs(base_dir: str) -> None:
    output_csv = os.path.join(base_dir, "contestants_with_groups.csv")
    feedback_csv = os.path.join(base_dir, "team_feedback.csv")

    assert os.path.exists(output_csv), "Output CSV not found"
    assert os.path.exists(feedback_csv), "Feedback CSV not found"

    df_out = pd.read_csv(output_csv)
    assert "Group" in df_out.columns, "Group column missing in output"
    assert df_out["Group"].isna().sum() == 0, "Some contestants were not assigned to a group"

    num_teams = 3
    expected_size = 4
    group_counts = df_out["Group"].value_counts()
    assert group_counts.index.nunique() == num_teams, "Unexpected number of groups assigned"
    assert all(abs(int(count) - expected_size) <= 1 for count in group_counts), "Group sizes are imbalanced"


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Generate and write synthetic inputs
    df = generate_synthetic_dataset(num_contestants=12)
    write_inputs(df, base_dir)

    # Run the main pipeline
    import team_formations as tf

    # Ensure relative file IO in team_formations resolves under utils/
    os.chdir(base_dir)

    tf.main()

    # Validate outputs
    validate_outputs(base_dir)
    print("VALIDATION PASSED: Team assignments look consistent.")


if __name__ == "__main__":
    main()


