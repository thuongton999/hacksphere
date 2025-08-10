"""
Configuration module for CommunityCatalyst AI Engine
==================================================

Provides centralized configuration management for embedding models,
similarity thresholds, and other AI engine parameters.
"""

import os
from dataclasses import dataclass
from typing import Dict, Any, Optional


@dataclass
class EmbeddingConfig:
    """Configuration for embedding generation."""
    model_name: str = "all-MiniLM-L6-v2"
    batch_size: int = 32
    normalize_embeddings: bool = True
    device: Optional[str] = None  # None = auto-detect


@dataclass
class RecommendationConfig:
    """Configuration for recommendation generation."""
    top_n_default: int = 5
    min_similarity_threshold: float = 0.1
    max_similarity_threshold: float = 1.0
    enable_explanations: bool = True
    
    # Filtering parameters
    require_opt_in: bool = True
    exclude_same_user: bool = True
    
    # Scoring weights (for future hybrid approaches)
    content_weight: float = 1.0
    collaborative_weight: float = 0.0  # Not implemented in MVP
    network_weight: float = 0.0  # Not implemented in MVP


@dataclass
class CommunityAnalysisConfig:
    """Configuration for community analysis features."""
    interest_cluster_min_size: int = 3
    max_clusters_per_analysis: int = 20
    meetup_topic_min_participants: int = 2
    max_suggested_topics: int = 10


@dataclass
class CommunityCatalystConfig:
    """Main configuration class for CommunityCatalyst AI Engine."""
    embedding: EmbeddingConfig
    recommendation: RecommendationConfig
    community_analysis: CommunityAnalysisConfig
    
    # Performance settings
    enable_caching: bool = True
    cache_ttl_hours: int = 24
    
    # Logging
    log_level: str = "INFO"
    enable_performance_metrics: bool = False
    
    @classmethod
    def from_env(cls) -> 'CommunityCatalystConfig':
        """Create configuration from environment variables."""
        return cls(
            embedding=EmbeddingConfig(
                model_name=os.getenv('COMCAT_EMBEDDING_MODEL', 'all-MiniLM-L6-v2'),
                batch_size=int(os.getenv('COMCAT_BATCH_SIZE', '32')),
                normalize_embeddings=os.getenv('COMCAT_NORMALIZE_EMBEDDINGS', 'true').lower() == 'true',
                device=os.getenv('COMCAT_DEVICE')  # None for auto-detect
            ),
            recommendation=RecommendationConfig(
                top_n_default=int(os.getenv('COMCAT_TOP_N', '5')),
                min_similarity_threshold=float(os.getenv('COMCAT_MIN_SIMILARITY', '0.1')),
                max_similarity_threshold=float(os.getenv('COMCAT_MAX_SIMILARITY', '1.0')),
                enable_explanations=os.getenv('COMCAT_ENABLE_EXPLANATIONS', 'true').lower() == 'true',
                require_opt_in=os.getenv('COMCAT_REQUIRE_OPT_IN', 'true').lower() == 'true',
                exclude_same_user=os.getenv('COMCAT_EXCLUDE_SAME_USER', 'true').lower() == 'true',
                content_weight=float(os.getenv('COMCAT_CONTENT_WEIGHT', '1.0')),
                collaborative_weight=float(os.getenv('COMCAT_COLLABORATIVE_WEIGHT', '0.0')),
                network_weight=float(os.getenv('COMCAT_NETWORK_WEIGHT', '0.0'))
            ),
            community_analysis=CommunityAnalysisConfig(
                interest_cluster_min_size=int(os.getenv('COMCAT_CLUSTER_MIN_SIZE', '3')),
                max_clusters_per_analysis=int(os.getenv('COMCAT_MAX_CLUSTERS', '20')),
                meetup_topic_min_participants=int(os.getenv('COMCAT_MEETUP_MIN_PARTICIPANTS', '2')),
                max_suggested_topics=int(os.getenv('COMCAT_MAX_SUGGESTED_TOPICS', '10'))
            ),
            enable_caching=os.getenv('COMCAT_ENABLE_CACHING', 'true').lower() == 'true',
            cache_ttl_hours=int(os.getenv('COMCAT_CACHE_TTL_HOURS', '24')),
            log_level=os.getenv('COMCAT_LOG_LEVEL', 'INFO'),
            enable_performance_metrics=os.getenv('COMCAT_ENABLE_METRICS', 'false').lower() == 'true'
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            'embedding': {
                'model_name': self.embedding.model_name,
                'batch_size': self.embedding.batch_size,
                'normalize_embeddings': self.embedding.normalize_embeddings,
                'device': self.embedding.device
            },
            'recommendation': {
                'top_n_default': self.recommendation.top_n_default,
                'min_similarity_threshold': self.recommendation.min_similarity_threshold,
                'max_similarity_threshold': self.recommendation.max_similarity_threshold,
                'enable_explanations': self.recommendation.enable_explanations,
                'require_opt_in': self.recommendation.require_opt_in,
                'exclude_same_user': self.recommendation.exclude_same_user,
                'content_weight': self.recommendation.content_weight,
                'collaborative_weight': self.recommendation.collaborative_weight,
                'network_weight': self.recommendation.network_weight
            },
            'community_analysis': {
                'interest_cluster_min_size': self.community_analysis.interest_cluster_min_size,
                'max_clusters_per_analysis': self.community_analysis.max_clusters_per_analysis,
                'meetup_topic_min_participants': self.community_analysis.meetup_topic_min_participants,
                'max_suggested_topics': self.community_analysis.max_suggested_topics
            },
            'enable_caching': self.enable_caching,
            'cache_ttl_hours': self.cache_ttl_hours,
            'log_level': self.log_level,
            'enable_performance_metrics': self.enable_performance_metrics
        }


# Supported embedding models with metadata
SUPPORTED_EMBEDDING_MODELS = {
    'all-MiniLM-L6-v2': {
        'dimensions': 384,
        'max_seq_length': 256,
        'description': 'Fast, lightweight model good for general similarity',
        'recommended_for': 'MVP, development, production'
    },
    'all-mpnet-base-v2': {
        'dimensions': 768,
        'max_seq_length': 384,
        'description': 'Higher quality embeddings, slower than MiniLM',
        'recommended_for': 'production with higher accuracy needs'
    },
    'multi-qa-MiniLM-L6-cos-v1': {
        'dimensions': 384,
        'max_seq_length': 512,
        'description': 'Optimized for question-answering and retrieval',
        'recommended_for': 'specialized use cases'
    },
    'paraphrase-multilingual-MiniLM-L12-v2': {
        'dimensions': 384,
        'max_seq_length': 128,
        'description': 'Multilingual support for international communities',
        'recommended_for': 'multilingual communities'
    }
}


def get_model_info(model_name: str) -> Dict[str, Any]:
    """Get metadata for a supported embedding model.
    
    Args:
        model_name: Name of the embedding model
        
    Returns:
        Dictionary with model metadata
        
    Raises:
        ValueError: If model is not supported
    """
    if model_name not in SUPPORTED_EMBEDDING_MODELS:
        raise ValueError(f"Unsupported model: {model_name}. "
                        f"Supported models: {list(SUPPORTED_EMBEDDING_MODELS.keys())}")
    
    return SUPPORTED_EMBEDDING_MODELS[model_name]


def validate_config(config: CommunityCatalystConfig) -> None:
    """Validate configuration parameters.
    
    Args:
        config: Configuration to validate
        
    Raises:
        ValueError: If configuration is invalid
    """
    # Validate embedding model
    if config.embedding.model_name not in SUPPORTED_EMBEDDING_MODELS:
        raise ValueError(f"Unsupported embedding model: {config.embedding.model_name}")
    
    # Validate similarity thresholds
    if not 0.0 <= config.recommendation.min_similarity_threshold <= 1.0:
        raise ValueError("min_similarity_threshold must be between 0.0 and 1.0")
    
    if not 0.0 <= config.recommendation.max_similarity_threshold <= 1.0:
        raise ValueError("max_similarity_threshold must be between 0.0 and 1.0")
    
    if config.recommendation.min_similarity_threshold > config.recommendation.max_similarity_threshold:
        raise ValueError("min_similarity_threshold cannot be greater than max_similarity_threshold")
    
    # Validate positive integers
    if config.recommendation.top_n_default <= 0:
        raise ValueError("top_n_default must be positive")
    
    if config.embedding.batch_size <= 0:
        raise ValueError("batch_size must be positive")
    
    if config.community_analysis.interest_cluster_min_size <= 0:
        raise ValueError("interest_cluster_min_size must be positive")
    
    # Validate weights sum to reasonable value for hybrid approaches
    total_weight = (config.recommendation.content_weight + 
                   config.recommendation.collaborative_weight + 
                   config.recommendation.network_weight)
    
    if total_weight <= 0:
        raise ValueError("At least one recommendation weight must be positive")


# Default configuration instance
DEFAULT_CONFIG = CommunityCatalystConfig.from_env()


if __name__ == "__main__":
    # Example usage and validation
    config = CommunityCatalystConfig.from_env()
    
    try:
        validate_config(config)
        print("Configuration is valid")
        print("Config summary:")
        print(f"  Embedding model: {config.embedding.model_name}")
        print(f"  Top N recommendations: {config.recommendation.top_n_default}")
        print(f"  Min similarity: {config.recommendation.min_similarity_threshold}")
        print(f"  Cluster min size: {config.community_analysis.interest_cluster_min_size}")
    except ValueError as e:
        print(f"Configuration error: {e}")
    
    # Show supported models
    print("\nSupported embedding models:")
    for model_name, info in SUPPORTED_EMBEDDING_MODELS.items():
        print(f"  {model_name}: {info['description']}")
