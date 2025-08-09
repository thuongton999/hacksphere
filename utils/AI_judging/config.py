"""
Configuration file for AI Judging System
"""

from dataclasses import dataclass
from typing import Dict, List, Any
import os

@dataclass
class JudgingCriteria:
    """Definition of judging criteria"""
    name: str
    description: str
    weight: float = 1.0
    min_score: float = 0.0
    max_score: float = 10.0

# Default judging criteria for hackathon/competition projects
DEFAULT_CRITERIA = [
    JudgingCriteria(
        name="innovation",
        description="Measures originality, novelty, and creativity of the project",
        weight=1.2,
        min_score=0.0,
        max_score=10.0
    ),
    JudgingCriteria(
        name="feasibility",
        description="Assesses technical and practical implementation possibility",
        weight=1.0,
        min_score=0.0,
        max_score=10.0
    ),
    JudgingCriteria(
        name="presentation",
        description="Evaluates clarity, structure, and communication quality",
        weight=0.8,
        min_score=0.0,
        max_score=10.0
    ),
    JudgingCriteria(
        name="impact",
        description="Measures potential social, economic, or scientific impact",
        weight=1.1,
        min_score=0.0,
        max_score=10.0
    ),
    JudgingCriteria(
        name="technical_quality",
        description="Assesses technical sophistication and implementation",
        weight=1.0,
        min_score=0.0,
        max_score=10.0
    )
]

# Specialized criteria for different competition types
COMPETITION_CRITERIA = {
    "hackathon": DEFAULT_CRITERIA,
    
    "research": [
        JudgingCriteria("novelty", "Originality and contribution to field", 1.3),
        JudgingCriteria("methodology", "Quality of research design and methods", 1.2),
        JudgingCriteria("results", "Significance and validity of findings", 1.1),
        JudgingCriteria("presentation", "Clarity and organization of presentation", 0.8),
        JudgingCriteria("impact", "Potential impact on research community", 1.0)
    ],
    
    "business": [
        JudgingCriteria("market_opportunity", "Size and accessibility of target market", 1.2),
        JudgingCriteria("business_model", "Viability and scalability of revenue model", 1.1),
        JudgingCriteria("competitive_advantage", "Unique value proposition and barriers", 1.0),
        JudgingCriteria("team", "Capability and experience of team", 0.9),
        JudgingCriteria("financial_projection", "Realistic revenue and growth projections", 1.0)
    ],
    
    "art_creative": [
        JudgingCriteria("creativity", "Originality and artistic innovation", 1.3),
        JudgingCriteria("technical_skill", "Mastery of chosen medium and technique", 1.1),
        JudgingCriteria("conceptual_depth", "Intellectual and emotional resonance", 1.0),
        JudgingCriteria("execution", "Quality and polish of final work", 0.9),
        JudgingCriteria("audience_impact", "Emotional and intellectual engagement", 1.0)
    ],
    
    "social_impact": [
        JudgingCriteria("social_need", "Urgency and scale of social problem", 1.2),
        JudgingCriteria("solution_effectiveness", "How well the solution addresses the need", 1.1),
        JudgingCriteria("scalability", "Potential to reach more beneficiaries", 1.0),
        JudgingCriteria("sustainability", "Long-term viability and impact", 1.0),
        JudgingCriteria("innovation", "Novelty in approach or technology", 0.9)
    ]
}

# Scoring thresholds and weights
SCORING_CONFIG = {
    "score_scale": (0, 10),
    "decimal_places": 1,
    "passing_threshold": 6.0,
    "excellent_threshold": 8.5,
    "weighted_average": True,
    "normalize_scores": True
}

# Text processing configuration
TEXT_PROCESSING_CONFIG = {
    "max_text_length": 10000,  # Maximum characters for processing
    "min_text_length": 50,     # Minimum characters required
    "keyword_extraction": {
        "max_keywords": 15,
        "min_word_length": 3,
        "remove_stopwords": True
    },
    "section_detection": {
        "enabled": True,
        "max_section_length": 1000,
        "min_section_length": 100
    }
}

# AI model configuration
AI_CONFIG = {
    "default_model": os.getenv("OPENROUTER_MODEL", "qwen/qwen3-30b-a3b-instruct-2507"),
    "temperature": 0.3,  # Lower for more consistent scoring
    "max_tokens": 1000,
    "retry_attempts": 3,
    "fallback_scoring": True
}

# Output configuration
OUTPUT_CONFIG = {
    "default_output_dir": "judging_results",
    "save_individual_results": True,
    "save_summary_report": True,
    "output_formats": ["json", "csv"],
    "include_timestamp": True,
    "include_metadata": True
}

# Validation rules
VALIDATION_RULES = {
    "require_project_id": True,
    "require_project_text": True,
    "min_text_length": 50,
    "max_text_length": 10000,
    "allowed_file_formats": [".txt", ".md", ".json", ".csv"],
    "max_batch_size": 100
}

def get_criteria_for_competition_type(competition_type: str) -> List[JudgingCriteria]:
    """Get judging criteria for a specific competition type"""
    return COMPETITION_CRITERIA.get(competition_type.lower(), DEFAULT_CRITERIA)

def get_criteria_names() -> List[str]:
    """Get list of all available criteria names"""
    all_criteria = set()
    for criteria_list in COMPETITION_CRITERIA.values():
        all_criteria.update([c.name for c in criteria_list])
    return sorted(list(all_criteria))

def validate_criteria(criteria: List[JudgingCriteria]) -> bool:
    """Validate that criteria configuration is correct"""
    if not criteria:
        return False
    
    for criterion in criteria:
        if not criterion.name or not criterion.description:
            return False
        if criterion.weight < 0:
            return False
        if criterion.min_score < 0 or criterion.max_score > 10:
            return False
        if criterion.min_score >= criterion.max_score:
            return False
    
    return True

def create_custom_criteria_template(competition_type: str = "custom") -> List[Dict[str, Any]]:
    """Create a template for custom judging criteria"""
    base_criteria = get_criteria_for_competition_type(competition_type)
    
    template = []
    for criterion in base_criteria:
        template.append({
            "name": criterion.name,
            "description": criterion.description,
            "weight": criterion.weight,
            "min_score": criterion.min_score,
            "max_score": criterion.max_score
        })
    
    return template
