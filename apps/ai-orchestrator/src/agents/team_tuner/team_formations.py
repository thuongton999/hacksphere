import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from itertools import combinations
import json

def load_contestant_data(file_path):
    """Load contestant data from a CSV file."""
    try:
        data = pd.read_csv(file_path)
        required_columns = ['Name', 'Skills', 'Interests', 'ExperienceLevel', 'ProjectPreference', 'PersonalityTrait']
        if not all(col in data.columns for col in required_columns):
            raise ValueError("Missing required columns in contestant data")
        return data
    except Exception as e:
        print(f"Error loading contestant data: {e}")
        return None

def load_project_requirements(config_path):
    """Load project requirements from a JSON config file."""
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        return config
    except Exception as e:
        print(f"Error loading project requirements: {e}")
        return None

def preprocess_data(data):
    """Preprocess contestant data for clustering and scoring."""
    # Normalize comma-separated string fields into clean lists (strip whitespace, drop empties)
    def normalize_list_field(value):
        if isinstance(value, str):
            return [token.strip() for token in value.split(',') if token.strip()]
        if isinstance(value, list):
            return [str(token).strip() for token in value if str(token).strip()]
        return []

    data = data.copy()
    data['Skills'] = data['Skills'].apply(normalize_list_field)
    data['Interests'] = data['Interests'].apply(normalize_list_field)

    # Encode categorical variables
    mlb_skills = MultiLabelBinarizer()
    mlb_interests = MultiLabelBinarizer()
    skills_matrix = mlb_skills.fit_transform(data['Skills'])
    interests_matrix = mlb_interests.fit_transform(data['Interests'])
    skills_encoded = pd.DataFrame(skills_matrix, columns=mlb_skills.classes_, index=data.index)
    interests_encoded = pd.DataFrame(interests_matrix, columns=mlb_interests.classes_, index=data.index)

    # Map experience levels to numerical values and handle unknowns/missing
    experience_map = {'Beginner': 1, 'Intermediate': 2, 'Expert': 3}
    data['ExperienceLevel'] = data['ExperienceLevel'].map(experience_map).fillna(2).astype(int)

    # Encode personality traits
    le_personality = LabelEncoder()
    data['PersonalityTrait'] = le_personality.fit_transform(data['PersonalityTrait'])

    # Combine features for clustering
    features = pd.concat(
        [skills_encoded, interests_encoded, data[['ExperienceLevel', 'PersonalityTrait']]],
        axis=1,
    )
    return data, features, mlb_skills, mlb_interests

def compute_weighted_score(team, project_requirements, data, mlb_skills, mlb_interests):
    """Compute a weighted score for a team based on skills, interests, experience, and personality."""
    skill_weight, interest_weight, exp_weight, personality_weight = 0.4, 0.3, 0.2, 0.1
    score = 0
    
    # Skills match (40%)
    required_skills = [s.strip() for s in project_requirements.get('required_skills', []) if str(s).strip()]
    team_skills = set()
    for idx in team:
        team_skills.update(data.loc[idx]['Skills'])
    skill_match = len(set(required_skills).intersection(team_skills)) / len(required_skills) if required_skills else 0
    score += skill_weight * skill_match
    
    # Interests alignment (30%)
    preferred_interests = [i.strip() for i in project_requirements.get('preferred_interests', []) if str(i).strip()]
    team_interests = set()
    for idx in team:
        team_interests.update(data.loc[idx]['Interests'])
    if preferred_interests:
        interest_match = len(set(preferred_interests).intersection(team_interests)) / len(preferred_interests)
    else:
        interest_match = 0
    score += interest_weight * interest_match
    
    # Experience balance (20%)
    exp_scores = data.loc[list(team), 'ExperienceLevel']
    if len(exp_scores) > 1 and np.mean(exp_scores) > 0:
        exp_balance = 1 - (np.std(exp_scores) / np.mean(exp_scores))
        exp_balance = max(0.0, min(1.0, float(exp_balance)))
    else:
        exp_balance = 0
    score += exp_weight * exp_balance
    
    # Personality diversity (10%)
    personalities = data.loc[list(team), 'PersonalityTrait']
    personality_diversity = len(set(personalities)) / len(personalities) if personalities.size > 0 else 0
    score += personality_weight * personality_diversity
    
    return score

def assign_groups(data, features, project_requirements, mlb_skills, mlb_interests):
    """Assign contestants to groups using clustering and graph-based optimization."""
    # Ensure the number of groups does not exceed the number of contestants
    num_groups = int(project_requirements.get('num_teams', 3))
    num_groups = max(1, min(num_groups, len(data)))
    team_size = project_requirements.get('team_size', 3)
    
    # Initial clustering with K-means
    kmeans = KMeans(n_clusters=num_groups, random_state=42, n_init=10)
    data['InitialCluster'] = kmeans.fit_predict(features)
    
    # Refine groups using graph-based optimization
    teams = []
    for cluster in range(num_groups):
        cluster_indices = data[data['InitialCluster'] == cluster].index
        best_team = []
        best_score = -1
        
        # Try combinations to find the best team
        for team in combinations(cluster_indices, min(team_size, len(cluster_indices))):
            score = compute_weighted_score(team, project_requirements, data, mlb_skills, mlb_interests)
            if score > best_score:
                best_score = score
                best_team = list(team)
        
        teams.append(best_team)
    
    # Assign remaining contestants
    assigned = set(sum(teams, []))
    unassigned = list(set(data.index) - assigned)
    for i, idx in enumerate(unassigned):
        teams[i % len(teams)].append(idx)
    
    # Assign group numbers
    data['Group'] = np.nan
    for group_id, team in enumerate(teams, 1):
        data.loc[team, 'Group'] = group_id
    
    # Drop temporary cluster column
    data = data.drop(columns=['InitialCluster'])
    # Ensure integer group labels if fully assigned
    if data['Group'].isna().sum() == 0:
        data['Group'] = data['Group'].astype(int)
    return data

def log_feedback(data, feedback_file):
    """Log team assignments for feedback and future algorithm improvement."""
    try:
        data[['Name', 'Group']].to_csv(feedback_file, index=False)
        print(f"Feedback logged to {feedback_file}")
    except Exception as e:
        print(f"Error logging feedback: {e}")

def save_data(data, output_path):
    """Save the updated table with group assignments."""
    try:
        data.to_csv(output_path, index=False)
        print(f"Data saved to {output_path}")
    except Exception as e:
        print(f"Error saving data: {e}")

def main():
    # Configuration
    contestant_file = "contestants.csv"
    config_file = "project_config.json"
    output_file = "contestants_with_groups.csv"
    feedback_file = "team_feedback.csv"
    
    # Load data
    data = load_contestant_data(contestant_file)
    if data is None:
        return
    
    config = load_project_requirements(config_file)
    if config is None:
        return
    
    # Preprocess data
    data, features, mlb_skills, mlb_interests = preprocess_data(data)
    
    # Assign groups
    data = assign_groups(data, features, config, mlb_skills, mlb_interests)
    
    # Log feedback for validation
    log_feedback(data, feedback_file)
    
    # Save output
    save_data(data, output_file)

if __name__ == "__main__":
    main()