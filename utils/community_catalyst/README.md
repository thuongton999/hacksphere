# CommunityCatalyst AI Engine

This package provides the core AI functionality for the CommunityCatalyst feature, enabling intelligent post-event community engagement through profile embeddings and connection recommendations.

## Features

- **Profile Embeddings**: Generate semantic embeddings from user profiles using SentenceTransformers
- **Similarity Matching**: Calculate cosine similarity between user profiles for content-based recommendations
- **Connection Recommendations**: Generate ranked recommendations with explanations
- **Community Analysis**: Identify interest clusters and suggest meetup topics
- **Configurable**: Environment-based configuration with validation

## Quick Start

```python
from community_catalyst_ai import create_community_catalyst_engine, UserProfile

# Create recommendation engine
engine = create_community_catalyst_engine()

# Create user profiles
profiles = [
    UserProfile(
        discord_user_id="user1",
        guild_id="guild1",
        skills=["Python", "Machine Learning"],
        interests=["AI", "Open Source"],
        about_me="Love building AI applications",
        project_history=[{"name": "ChatBot", "description": "AI chatbot"}],
        consent_status="opted_in"
    ),
    # ... more profiles
]

# Generate recommendations
recommendations = engine.generate_recommendations_batch(
    source_profiles=profiles,
    target_profiles=profiles,
    top_n_per_user=5
)

# Print results
for rec in recommendations:
    print(f"{rec.source_discord_user_id} -> {rec.target_discord_user_id}")
    print(f"Score: {rec.similarity_score:.3f}")
    print(f"Reason: {rec.recommendation_reason}")
```

## Installation

Install dependencies:

```bash
pip install -r requirements.txt
```

For GPU support (optional):

```bash
pip install torch>=2.0.0
```

## Configuration

Configure via environment variables:

```bash
# Embedding model (default: all-MiniLM-L6-v2)
export COMCAT_EMBEDDING_MODEL=all-mpnet-base-v2

# Recommendation settings
export COMCAT_TOP_N=5
export COMCAT_MIN_SIMILARITY=0.1

# Community analysis
export COMCAT_CLUSTER_MIN_SIZE=3

# Performance
export COMCAT_BATCH_SIZE=32
export COMCAT_ENABLE_CACHING=true
```

## Supported Models

| Model | Dimensions | Speed | Quality | Use Case |
|-------|------------|-------|---------|----------|
| `all-MiniLM-L6-v2` | 384 | Fast | Good | MVP, Development |
| `all-mpnet-base-v2` | 768 | Medium | Excellent | Production |
| `multi-qa-MiniLM-L6-cos-v1` | 384 | Fast | Good | Q&A focused |
| `paraphrase-multilingual-MiniLM-L12-v2` | 384 | Fast | Good | Multilingual |

## Core Components

### UserProfile
Data class representing a user with skills, interests, projects, and consent status.

### ProfileEmbeddingEngine
Handles text embedding generation using SentenceTransformers.

### SimilarityEngine
Calculates cosine similarity between embeddings.

### RecommendationEngine
Main engine for generating connection recommendations with explanations.

### CommunityAnalyzer
Analyzes community patterns for interest clustering and meetup suggestions.

## Testing

Run the test suite:

```bash
python -m pytest test_community_catalyst_ai.py -v
```

Or run basic tests:

```bash
python test_community_catalyst_ai.py
```

## Integration

This package integrates with:

- **Supabase/PostgreSQL**: Store embeddings using pgvector
- **Discord Bot**: Profile data from slash commands
- **FastAPI**: REST endpoints for recommendations
- **APScheduler**: Batch processing jobs

See `apps/core/.docs/ComCat_Discord_MVP_Plan.md` for full system architecture.

## Performance Notes

- **Cold Start**: First model load takes ~2-5 seconds
- **Embedding Generation**: ~1-10ms per profile depending on model
- **Similarity Calculation**: ~0.1ms per comparison for 384-dim vectors
- **Batch Processing**: Recommended for >10 profiles

## Privacy & Consent

- Users must opt-in via `consent_status = "opted_in"`
- Opted-out users are excluded from all processing
- Profile embeddings can be deleted on opt-out
- No cross-guild data mixing

## Troubleshooting

**Model Download Issues**:
```bash
# Pre-download models
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

**GPU Issues**:
```bash
# Check PyTorch CUDA
python -c "import torch; print(torch.cuda.is_available())"
```

**Memory Issues**:
```bash
# Reduce batch size
export COMCAT_BATCH_SIZE=16
```

## Contributing

1. Follow existing code patterns from `utils/` directory
2. Add tests for new functionality
3. Update documentation
4. Validate configuration changes

## References

- [SentenceTransformers Documentation](https://www.sbert.net/)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [pgvector Extension](https://github.com/pgvector/pgvector)
