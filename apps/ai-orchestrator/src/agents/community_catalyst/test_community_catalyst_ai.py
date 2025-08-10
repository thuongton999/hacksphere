"""
Tests for CommunityCatalyst AI Engine
===================================

Basic tests to verify the AI functionality works correctly.
Run with: python -m pytest test_community_catalyst_ai.py -v
"""

import pytest
import numpy as np
from community_catalyst_ai import (
    UserProfile, ConnectionRecommendation, ProfileEmbeddingEngine, 
    SimilarityEngine, RecommendationEngine, CommunityAnalyzer,
    create_community_catalyst_engine
)
from config import CommunityCatalystConfig, DEFAULT_CONFIG, validate_config


class TestUserProfile:
    """Test UserProfile data class."""
    
    def test_profile_creation(self):
        """Test creating a user profile."""
        profile = UserProfile(
            discord_user_id="test_user",
            guild_id="test_guild",
            skills=["Python", "ML"],
            interests=["AI", "Hackathons"],
            about_me="Test user",
            project_history=[{"name": "Test Project"}],
            consent_status="opted_in"
        )
        
        assert profile.discord_user_id == "test_user"
        assert profile.guild_id == "test_guild"
        assert len(profile.skills) == 2
        assert len(profile.interests) == 2
    
    def test_profile_text_generation(self):
        """Test profile text generation for embedding."""
        profile = UserProfile(
            discord_user_id="test_user",
            guild_id="test_guild", 
            skills=["Python", "JavaScript"],
            interests=["Web Dev", "AI"],
            about_me="I love coding",
            project_history=[
                {"name": "ChatBot", "description": "AI chatbot"},
                {"name": "Website"}  # No description
            ]
        )
        
        text = profile.to_profile_text()
        
        assert "Python, JavaScript" in text
        assert "Web Dev, AI" in text
        assert "I love coding" in text
        assert "AI chatbot" in text
        assert "Skills:" in text
        assert "Interests:" in text
    
    def test_empty_profile_text(self):
        """Test handling of empty profile fields."""
        profile = UserProfile(
            discord_user_id="empty_user",
            guild_id="test_guild",
            skills=[],
            interests=[],
            about_me="",
            project_history=[]
        )
        
        text = profile.to_profile_text()
        
        # Should still have structure even if empty
        assert "Skills:" in text
        assert "Interests:" in text


class TestProfileEmbeddingEngine:
    """Test ProfileEmbeddingEngine functionality."""
    
    @pytest.fixture
    def embedding_engine(self):
        """Create embedding engine for testing."""
        return ProfileEmbeddingEngine(model_name="all-MiniLM-L6-v2")
    
    @pytest.fixture
    def sample_profile(self):
        """Create sample profile for testing."""
        return UserProfile(
            discord_user_id="test_user",
            guild_id="test_guild",
            skills=["Python", "Machine Learning"],
            interests=["AI", "Open Source"],
            about_me="AI enthusiast and developer",
            project_history=[{"name": "ML Project", "description": "Classification model"}]
        )
    
    def test_model_loading(self, embedding_engine):
        """Test that the model loads correctly."""
        assert embedding_engine.model is not None
        assert embedding_engine.get_embedding_dimension() > 0
    
    def test_embedding_generation(self, embedding_engine, sample_profile):
        """Test generating embeddings for a profile."""
        embedding = embedding_engine.create_user_embedding(sample_profile)
        
        assert isinstance(embedding, np.ndarray)
        assert embedding.shape[0] == embedding_engine.get_embedding_dimension()
        assert not np.allclose(embedding, 0)  # Should not be all zeros
    
    def test_empty_profile_embedding(self, embedding_engine):
        """Test handling of empty profiles."""
        empty_profile = UserProfile(
            discord_user_id="empty_user",
            guild_id="test_guild",
            skills=[],
            interests=[],
            about_me="",
            project_history=[]
        )
        
        embedding = embedding_engine.create_user_embedding(empty_profile)
        
        assert isinstance(embedding, np.ndarray)
        assert embedding.shape[0] == embedding_engine.get_embedding_dimension()
        # Empty profile should result in zero vector
        assert np.allclose(embedding, 0)
    
    def test_batch_embedding_generation(self, embedding_engine):
        """Test batch embedding generation."""
        profiles = [
            UserProfile(
                discord_user_id=f"user_{i}",
                guild_id="test_guild",
                skills=["Python"] if i % 2 == 0 else ["JavaScript"],
                interests=["AI"] if i % 2 == 0 else ["Web Dev"],
                about_me=f"User {i}",
                project_history=[]
            )
            for i in range(3)
        ]
        
        embeddings = embedding_engine.create_embeddings_batch(profiles)
        
        assert len(embeddings) == 3
        assert all(isinstance(emb, np.ndarray) for emb in embeddings)
        assert all(emb.shape[0] == embedding_engine.get_embedding_dimension() for emb in embeddings)


class TestSimilarityEngine:
    """Test SimilarityEngine functionality."""
    
    def test_cosine_similarity_calculation(self):
        """Test cosine similarity calculation."""
        # Create test embeddings
        source = np.array([1.0, 0.0, 0.0])
        targets = [
            np.array([1.0, 0.0, 0.0]),  # Same as source = 1.0 similarity
            np.array([0.0, 1.0, 0.0]),  # Orthogonal = 0.0 similarity
            np.array([0.5, 0.5, 0.0])   # 45 degrees = ~0.707 similarity
        ]
        
        similarities = SimilarityEngine.cosine_similarity_scores(source, targets)
        
        assert len(similarities) == 3
        assert abs(similarities[0] - 1.0) < 0.001  # Should be ~1.0
        assert abs(similarities[1] - 0.0) < 0.001  # Should be ~0.0
        assert 0.5 < similarities[2] < 0.8  # Should be ~0.707
    
    def test_find_top_similar(self):
        """Test finding top similar users."""
        source = np.array([1.0, 0.0])
        targets = [
            np.array([0.9, 0.1]),  # High similarity
            np.array([0.1, 0.9]),  # Low similarity
            np.array([0.8, 0.2])   # Medium similarity
        ]
        user_ids = ["user1", "user2", "user3"]
        
        top_similar = SimilarityEngine.find_top_similar(source, targets, user_ids, top_n=2)
        
        assert len(top_similar) == 2
        assert top_similar[0][0] == "user1"  # Should be most similar
        assert top_similar[1][0] == "user3"  # Should be second most similar
        assert top_similar[0][1] > top_similar[1][1]  # Scores should be descending


class TestRecommendationEngine:
    """Test RecommendationEngine functionality."""
    
    @pytest.fixture
    def recommendation_engine(self):
        """Create recommendation engine for testing."""
        return create_community_catalyst_engine()
    
    @pytest.fixture
    def sample_profiles(self):
        """Create sample profiles for testing."""
        return [
            UserProfile(
                discord_user_id="user1",
                guild_id="test_guild",
                skills=["Python", "ML"],
                interests=["AI", "Data Science"],
                about_me="ML Engineer",
                project_history=[{"name": "AI Project"}],
                consent_status="opted_in"
            ),
            UserProfile(
                discord_user_id="user2", 
                guild_id="test_guild",
                skills=["Python", "Web Dev"],
                interests=["AI", "Startups"],
                about_me="Full-stack developer",
                project_history=[{"name": "Web App"}],
                consent_status="opted_in"
            ),
            UserProfile(
                discord_user_id="user3",
                guild_id="test_guild",
                skills=["Design", "UX"],
                interests=["Design", "Art"],
                about_me="UI/UX Designer",
                project_history=[{"name": "Design System"}],
                consent_status="opted_in"
            )
        ]
    
    def test_single_user_recommendations(self, recommendation_engine, sample_profiles):
        """Test generating recommendations for a single user."""
        source_profile = sample_profiles[0]
        target_profiles = sample_profiles[1:]  # Exclude source
        
        recommendations = recommendation_engine.generate_recommendations_for_user(
            source_profile=source_profile,
            target_profiles=target_profiles,
            top_n=2
        )
        
        assert len(recommendations) <= 2
        assert all(isinstance(rec, ConnectionRecommendation) for rec in recommendations)
        assert all(rec.source_discord_user_id == "user1" for rec in recommendations)
        assert all(rec.target_discord_user_id in ["user2", "user3"] for rec in recommendations)
        assert all(0.0 <= rec.similarity_score <= 1.0 for rec in recommendations)
        
        # user1 and user2 should have higher similarity due to shared Python and AI
        user2_rec = next((r for r in recommendations if r.target_discord_user_id == "user2"), None)
        user3_rec = next((r for r in recommendations if r.target_discord_user_id == "user3"), None)
        
        if user2_rec and user3_rec:
            assert user2_rec.similarity_score > user3_rec.similarity_score
    
    def test_batch_recommendations(self, recommendation_engine, sample_profiles):
        """Test generating recommendations for multiple users."""
        recommendations = recommendation_engine.generate_recommendations_batch(
            source_profiles=sample_profiles,
            target_profiles=sample_profiles,
            top_n_per_user=1
        )
        
        # Should have recommendations for each opted-in user
        assert len(recommendations) <= len(sample_profiles)
        
        # Check that no user is recommended to themselves
        for rec in recommendations:
            assert rec.source_discord_user_id != rec.target_discord_user_id
    
    def test_opt_out_filtering(self, recommendation_engine):
        """Test that opted-out users are excluded."""
        profiles = [
            UserProfile(
                discord_user_id="opted_in_user",
                guild_id="test_guild",
                skills=["Python"],
                interests=["AI"],
                about_me="Opted in user",
                project_history=[],
                consent_status="opted_in"
            ),
            UserProfile(
                discord_user_id="opted_out_user",
                guild_id="test_guild",
                skills=["Python"],
                interests=["AI"], 
                about_me="Opted out user",
                project_history=[],
                consent_status="opted_out"
            )
        ]
        
        # Should not generate recommendations for opted-out user
        recommendations = recommendation_engine.generate_recommendations_batch(
            source_profiles=profiles,
            target_profiles=profiles
        )
        
        # Only opted-in user should have recommendations
        source_ids = [rec.source_discord_user_id for rec in recommendations]
        assert "opted_in_user" in source_ids or len(source_ids) == 0  # Might be 0 if no targets
        assert "opted_out_user" not in source_ids


class TestCommunityAnalyzer:
    """Test CommunityAnalyzer functionality."""
    
    @pytest.fixture
    def sample_profiles(self):
        """Create sample profiles for community analysis."""
        return [
            UserProfile("user1", "guild1", [], ["AI", "Machine Learning"], "", [], "opted_in"),
            UserProfile("user2", "guild1", [], ["AI", "Web Development"], "", [], "opted_in"),
            UserProfile("user3", "guild1", [], ["AI", "Data Science"], "", [], "opted_in"),
            UserProfile("user4", "guild1", [], ["Design", "UX"], "", [], "opted_in"),
            UserProfile("user5", "guild1", [], ["Design", "Art"], "", [], "opted_in"),
        ]
    
    def test_interest_clustering(self, sample_profiles):
        """Test identifying interest clusters."""
        clusters = CommunityAnalyzer.identify_interest_clusters(sample_profiles, min_cluster_size=2)
        
        # Should find clusters for "AI" and "Design"
        cluster_interests = [cluster['interest'] for cluster in clusters]
        assert 'ai' in cluster_interests
        assert 'design' in cluster_interests
        
        # AI cluster should have 3 users
        ai_cluster = next(cluster for cluster in clusters if cluster['interest'] == 'ai')
        assert ai_cluster['size'] == 3
    
    def test_meetup_topic_suggestions(self, sample_profiles):
        """Test suggesting meetup topics."""
        topics = CommunityAnalyzer.suggest_meetup_topics(sample_profiles)
        
        assert len(topics) > 0
        assert any('AI' in topic for topic in topics)
        assert any('Design' in topic for topic in topics)


class TestConfiguration:
    """Test configuration functionality."""
    
    def test_default_config_validation(self):
        """Test that default configuration is valid."""
        validate_config(DEFAULT_CONFIG)  # Should not raise
    
    def test_config_from_env(self):
        """Test creating configuration from environment."""
        config = CommunityCatalystConfig.from_env()
        
        assert config.embedding.model_name in ["all-MiniLM-L6-v2"]  # Default
        assert config.recommendation.top_n_default > 0
        assert 0.0 <= config.recommendation.min_similarity_threshold <= 1.0
    
    def test_invalid_config_validation(self):
        """Test validation of invalid configurations."""
        config = CommunityCatalystConfig.from_env()
        
        # Test invalid similarity threshold
        config.recommendation.min_similarity_threshold = -0.5
        with pytest.raises(ValueError):
            validate_config(config)
        
        # Test invalid top_n
        config.recommendation.min_similarity_threshold = 0.1  # Reset
        config.recommendation.top_n_default = 0
        with pytest.raises(ValueError):
            validate_config(config)


if __name__ == "__main__":
    # Run basic tests if executed directly
    import sys
    
    print("Running basic CommunityCatalyst AI tests...")
    
    # Test profile creation
    profile = UserProfile(
        discord_user_id="test",
        guild_id="test", 
        skills=["Python"],
        interests=["AI"],
        about_me="Test user",
        project_history=[]
    )
    print(f"✓ Created profile: {profile.discord_user_id}")
    
    # Test embedding engine
    engine = ProfileEmbeddingEngine()
    embedding = engine.create_user_embedding(profile)
    print(f"✓ Generated embedding with dimension: {embedding.shape[0]}")
    
    # Test recommendation engine
    rec_engine = create_community_catalyst_engine()
    print(f"✓ Created recommendation engine")
    
    print("Basic tests passed! Run with pytest for full test suite.")
