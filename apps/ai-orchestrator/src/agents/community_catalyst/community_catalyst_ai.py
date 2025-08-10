"""
CommunityCatalyst AI Engine
==========================

This module provides the core AI functionality for the CommunityCatalyst feature,
including profile embeddings, similarity calculations, and connection recommendations.

Based on the implementation described in core/.docs/IP_ComCat.md and 
core/.docs/ComCat_Discord_MVP_Plan.md
"""

import json
import logging
import os
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Union, Any
import uuid

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


logger = logging.getLogger(__name__)


@dataclass
class UserProfile:
    """Data class representing a user profile for embedding and recommendations."""
    discord_user_id: str
    guild_id: str
    skills: List[str]
    interests: List[str]
    about_me: str
    project_history: List[Dict[str, Any]]
    consent_status: str = "opted_out"
    
    def to_profile_text(self) -> str:
        """Convert profile to text suitable for embedding."""
        # Extract project descriptions from history
        project_descriptions = []
        if self.project_history:
            for project in self.project_history:
                if isinstance(project, dict):
                    desc = project.get('description', '') or project.get('name', '')
                    if desc:
                        project_descriptions.append(str(desc))
        
        # Clean and format text components
        skills_text = ', '.join(self.skills) if self.skills else ''
        interests_text = ', '.join(self.interests) if self.interests else ''
        projects_text = '. '.join(project_descriptions)
        about_text = self.about_me or ''
        
        # Combine with clear structure
        profile_text = f"""
        Skills: {skills_text}
        Interests: {interests_text}
        Projects: {projects_text}
        About: {about_text}
        """.strip()
        
        return profile_text


@dataclass
class ConnectionRecommendation:
    """Data class for a connection recommendation between two users."""
    source_discord_user_id: str
    target_discord_user_id: str
    similarity_score: float
    recommendation_reason: str
    explanations: Dict[str, Any]
    guild_id: str
    campaign_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage/API responses."""
        return {
            'source_discord_user_id': self.source_discord_user_id,
            'target_discord_user_id': self.target_discord_user_id,
            'similarity_score': self.similarity_score,
            'recommendation_reason': self.recommendation_reason,
            'explanations': self.explanations,
            'guild_id': self.guild_id,
            'campaign_id': self.campaign_id
        }


class ProfileEmbeddingEngine:
    """Handles user profile text embedding using SentenceTransformers."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize with specified embedding model.
        
        Args:
            model_name: HuggingFace model name for SentenceTransformers
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the embedding model."""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Successfully loaded model with embedding dim: {self.model.get_sentence_embedding_dimension()}")
        except Exception as e:
            logger.error(f"Failed to load embedding model {self.model_name}: {e}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this model."""
        if not self.model:
            self._load_model()
        return self.model.get_sentence_embedding_dimension()
    
    def create_user_embedding(self, user_profile: UserProfile) -> np.ndarray:
        """Create embedding vector for a user profile.
        
        Args:
            user_profile: UserProfile object with skills, interests, etc.
            
        Returns:
            numpy array of embedding vector
        """
        if not self.model:
            self._load_model()
        
        profile_text = user_profile.to_profile_text()
        
        # Handle empty profiles
        if not profile_text.strip():
            logger.warning(f"Empty profile text for user {user_profile.discord_user_id}")
            # Return zero vector for empty profiles
            return np.zeros(self.get_embedding_dimension())
        
        try:
            embedding = self.model.encode(profile_text, convert_to_numpy=True)
            logger.debug(f"Created embedding for user {user_profile.discord_user_id}, shape: {embedding.shape}")
            return embedding
        except Exception as e:
            logger.error(f"Failed to create embedding for user {user_profile.discord_user_id}: {e}")
            # Return zero vector on error
            return np.zeros(self.get_embedding_dimension())
    
    def create_embeddings_batch(self, user_profiles: List[UserProfile]) -> List[np.ndarray]:
        """Create embeddings for a batch of user profiles.
        
        Args:
            user_profiles: List of UserProfile objects
            
        Returns:
            List of embedding vectors (numpy arrays)
        """
        if not self.model:
            self._load_model()
        
        profile_texts = [profile.to_profile_text() for profile in user_profiles]
        
        try:
            embeddings = self.model.encode(profile_texts, convert_to_numpy=True)
            logger.info(f"Created embeddings for {len(user_profiles)} profiles")
            return [embedding for embedding in embeddings]
        except Exception as e:
            logger.error(f"Failed to create batch embeddings: {e}")
            # Return zero vectors for all profiles on error
            return [np.zeros(self.get_embedding_dimension()) for _ in user_profiles]


class SimilarityEngine:
    """Handles similarity calculations between user embeddings."""
    
    @staticmethod
    def cosine_similarity_scores(source_embedding: np.ndarray, 
                                target_embeddings: List[np.ndarray]) -> List[float]:
        """Calculate cosine similarity between source embedding and list of targets.
        
        Args:
            source_embedding: Embedding vector for source user
            target_embeddings: List of embedding vectors for target users
            
        Returns:
            List of similarity scores (0.0 to 1.0)
        """
        if not target_embeddings:
            return []
        
        # Reshape source embedding for sklearn
        source_reshaped = source_embedding.reshape(1, -1)
        
        # Stack target embeddings
        targets_matrix = np.vstack(target_embeddings)
        
        # Calculate cosine similarity
        similarities = cosine_similarity(source_reshaped, targets_matrix)[0]
        
        # Convert to list and ensure positive values (cosine can be negative)
        return [max(0.0, float(sim)) for sim in similarities]
    
    @staticmethod
    def find_top_similar(source_embedding: np.ndarray,
                        target_embeddings: List[np.ndarray],
                        target_user_ids: List[str],
                        top_n: int = 5) -> List[Tuple[str, float]]:
        """Find top N most similar users to the source.
        
        Args:
            source_embedding: Embedding vector for source user
            target_embeddings: List of embedding vectors for potential matches
            target_user_ids: List of discord_user_ids corresponding to target_embeddings
            top_n: Number of top matches to return
            
        Returns:
            List of (discord_user_id, similarity_score) tuples, sorted by score desc
        """
        if len(target_embeddings) != len(target_user_ids):
            raise ValueError("Mismatch between embeddings and user_ids lengths")
        
        similarities = SimilarityEngine.cosine_similarity_scores(source_embedding, target_embeddings)
        
        # Pair with user IDs and sort by similarity (descending)
        user_similarities = list(zip(target_user_ids, similarities))
        user_similarities.sort(key=lambda x: x[1], reverse=True)
        
        return user_similarities[:top_n]


class RecommendationEngine:
    """Main engine for generating connection recommendations."""
    
    def __init__(self, embedding_engine: ProfileEmbeddingEngine):
        """Initialize with an embedding engine."""
        self.embedding_engine = embedding_engine
    
    def _generate_recommendation_reason(self, 
                                      source_profile: UserProfile,
                                      target_profile: UserProfile,
                                      similarity_score: float) -> str:
        """Generate human-readable reason for recommendation.
        
        Args:
            source_profile: Profile of the user receiving recommendation
            target_profile: Profile of the recommended user
            similarity_score: Computed similarity score
            
        Returns:
            Human-readable reason string
        """
        reasons = []
        
        # Find overlapping skills
        source_skills = set(skill.lower() for skill in source_profile.skills)
        target_skills = set(skill.lower() for skill in target_profile.skills)
        common_skills = source_skills.intersection(target_skills)
        
        if common_skills:
            skills_text = ', '.join(sorted(common_skills)[:3])  # Top 3
            reasons.append(f"shared skills in {skills_text}")
        
        # Find overlapping interests
        source_interests = set(interest.lower() for interest in source_profile.interests)
        target_interests = set(interest.lower() for interest in target_profile.interests)
        common_interests = source_interests.intersection(target_interests)
        
        if common_interests:
            interests_text = ', '.join(sorted(common_interests)[:3])  # Top 3
            reasons.append(f"mutual interest in {interests_text}")
        
        # Find complementary skills (source lacks, target has)
        complementary_skills = target_skills - source_skills
        if complementary_skills:
            comp_text = ', '.join(sorted(complementary_skills)[:2])  # Top 2
            reasons.append(f"complementary expertise in {comp_text}")
        
        # Default fallback
        if not reasons:
            if similarity_score > 0.7:
                reasons.append("strong profile compatibility")
            elif similarity_score > 0.5:
                reasons.append("good potential for collaboration")
            else:
                reasons.append("interesting profile match")
        
        return " and ".join(reasons)
    
    def _create_explanations(self,
                           source_profile: UserProfile,
                           target_profile: UserProfile,
                           similarity_score: float) -> Dict[str, Any]:
        """Create detailed explanations for the recommendation.
        
        Args:
            source_profile: Profile of the user receiving recommendation
            target_profile: Profile of the recommended user  
            similarity_score: Computed similarity score
            
        Returns:
            Dictionary with detailed explanation data
        """
        # Skill analysis
        source_skills = set(skill.lower() for skill in source_profile.skills)
        target_skills = set(skill.lower() for skill in target_profile.skills)
        common_skills = list(source_skills.intersection(target_skills))
        complementary_skills = list(target_skills - source_skills)
        
        # Interest analysis
        source_interests = set(interest.lower() for interest in source_profile.interests)
        target_interests = set(interest.lower() for interest in target_profile.interests)
        common_interests = list(source_interests.intersection(target_interests))
        
        return {
            'similarity_score': float(similarity_score),
            'common_skills': common_skills[:5],  # Top 5
            'complementary_skills': complementary_skills[:5],  # Top 5
            'common_interests': common_interests[:5],  # Top 5
            'recommendation_strength': 'high' if similarity_score > 0.7 else 'medium' if similarity_score > 0.4 else 'low'
        }
    
    def generate_recommendations_for_user(self,
                                        source_profile: UserProfile,
                                        target_profiles: List[UserProfile],
                                        top_n: int = 5,
                                        min_similarity: float = 0.1,
                                        campaign_id: Optional[str] = None) -> List[ConnectionRecommendation]:
        """Generate connection recommendations for a single user.
        
        Args:
            source_profile: Profile of user to generate recommendations for
            target_profiles: List of potential connection profiles
            top_n: Maximum number of recommendations to return
            min_similarity: Minimum similarity score threshold
            campaign_id: Optional campaign identifier for grouping
            
        Returns:
            List of ConnectionRecommendation objects, sorted by similarity desc
        """
        if not target_profiles:
            logger.warning(f"No target profiles provided for user {source_profile.discord_user_id}")
            return []
        
        # Filter out users who haven't opted in
        opted_in_targets = [p for p in target_profiles if p.consent_status == "opted_in"]
        
        # Filter out self (shouldn't happen, but safety check)
        opted_in_targets = [p for p in opted_in_targets 
                           if p.discord_user_id != source_profile.discord_user_id]
        
        if not opted_in_targets:
            logger.info(f"No valid target profiles for user {source_profile.discord_user_id}")
            return []
        
        # Generate embeddings
        source_embedding = self.embedding_engine.create_user_embedding(source_profile)
        target_embeddings = self.embedding_engine.create_embeddings_batch(opted_in_targets)
        target_user_ids = [p.discord_user_id for p in opted_in_targets]
        
        # Find similar users
        similar_users = SimilarityEngine.find_top_similar(
            source_embedding, target_embeddings, target_user_ids, top_n * 2  # Get more for filtering
        )
        
        # Create recommendations
        recommendations = []
        target_profile_map = {p.discord_user_id: p for p in opted_in_targets}
        
        for target_user_id, similarity_score in similar_users:
            if similarity_score < min_similarity:
                continue
                
            target_profile = target_profile_map[target_user_id]
            
            # Generate reason and explanations
            reason = self._generate_recommendation_reason(source_profile, target_profile, similarity_score)
            explanations = self._create_explanations(source_profile, target_profile, similarity_score)
            
            recommendation = ConnectionRecommendation(
                source_discord_user_id=source_profile.discord_user_id,
                target_discord_user_id=target_user_id,
                similarity_score=similarity_score,
                recommendation_reason=reason,
                explanations=explanations,
                guild_id=source_profile.guild_id,
                campaign_id=campaign_id
            )
            
            recommendations.append(recommendation)
            
            if len(recommendations) >= top_n:
                break
        
        logger.info(f"Generated {len(recommendations)} recommendations for user {source_profile.discord_user_id}")
        return recommendations
    
    def generate_recommendations_batch(self,
                                     source_profiles: List[UserProfile],
                                     target_profiles: List[UserProfile],
                                     top_n_per_user: int = 5,
                                     min_similarity: float = 0.1,
                                     campaign_id: Optional[str] = None) -> List[ConnectionRecommendation]:
        """Generate recommendations for multiple users in batch.
        
        Args:
            source_profiles: List of users to generate recommendations for
            target_profiles: List of potential connection profiles (includes sources)
            top_n_per_user: Maximum recommendations per source user
            min_similarity: Minimum similarity score threshold
            campaign_id: Optional campaign identifier for grouping
            
        Returns:
            List of all ConnectionRecommendation objects
        """
        if not campaign_id:
            campaign_id = str(uuid.uuid4())
        
        all_recommendations = []
        
        for source_profile in source_profiles:
            if source_profile.consent_status != "opted_in":
                logger.debug(f"Skipping user {source_profile.discord_user_id} - not opted in")
                continue
            
            user_recs = self.generate_recommendations_for_user(
                source_profile=source_profile,
                target_profiles=target_profiles,
                top_n=top_n_per_user,
                min_similarity=min_similarity,
                campaign_id=campaign_id
            )
            
            all_recommendations.extend(user_recs)
        
        logger.info(f"Generated {len(all_recommendations)} total recommendations for {len(source_profiles)} users")
        return all_recommendations


class CommunityAnalyzer:
    """Analyzes community patterns for engagement optimization."""
    
    @staticmethod
    def identify_interest_clusters(profiles: List[UserProfile], 
                                 min_cluster_size: int = 3) -> List[Dict[str, Any]]:
        """Identify clusters of users with similar interests for group activities.
        
        Args:
            profiles: List of user profiles to analyze
            min_cluster_size: Minimum number of users required for a cluster
            
        Returns:
            List of cluster dictionaries with user lists and common interests
        """
        # Count interest frequencies
        interest_to_users = {}
        for profile in profiles:
            if profile.consent_status != "opted_in":
                continue
            for interest in profile.interests:
                interest_lower = interest.lower().strip()
                if interest_lower not in interest_to_users:
                    interest_to_users[interest_lower] = []
                interest_to_users[interest_lower].append(profile.discord_user_id)
        
        # Find clusters with sufficient size
        clusters = []
        for interest, user_list in interest_to_users.items():
            if len(user_list) >= min_cluster_size:
                clusters.append({
                    'interest': interest,
                    'users': user_list,
                    'size': len(user_list),
                    'type': 'interest_based'
                })
        
        # Sort by cluster size (descending)
        clusters.sort(key=lambda x: x['size'], reverse=True)
        
        logger.info(f"Identified {len(clusters)} interest clusters")
        return clusters
    
    @staticmethod
    def suggest_meetup_topics(profiles: List[UserProfile]) -> List[str]:
        """Suggest topics for community meetups based on popular interests.
        
        Args:
            profiles: List of user profiles to analyze
            
        Returns:
            List of suggested meetup topics
        """
        opted_in_profiles = [p for p in profiles if p.consent_status == "opted_in"]
        
        # Count all interests
        interest_counts = {}
        for profile in opted_in_profiles:
            for interest in profile.interests:
                interest_lower = interest.lower().strip()
                interest_counts[interest_lower] = interest_counts.get(interest_lower, 0) + 1
        
        # Sort by popularity and format as meetup topics
        popular_interests = sorted(interest_counts.items(), key=lambda x: x[1], reverse=True)
        
        topics = []
        for interest, count in popular_interests[:10]:  # Top 10
            if count >= 2:  # At least 2 people interested
                # Format as meetup topic
                topic = f"{interest.title()} Discussion & Networking"
                topics.append(topic)
        
        return topics


# Convenience factory function
def create_community_catalyst_engine(model_name: str = "all-MiniLM-L6-v2") -> RecommendationEngine:
    """Create a fully configured CommunityCatalyst recommendation engine.
    
    Args:
        model_name: SentenceTransformer model name to use for embeddings
        
    Returns:
        Configured RecommendationEngine instance
    """
    embedding_engine = ProfileEmbeddingEngine(model_name=model_name)
    return RecommendationEngine(embedding_engine)


# Configuration helpers
def get_default_config() -> Dict[str, Any]:
    """Get default configuration for CommunityCatalyst AI."""
    return {
        'embedding_model': os.getenv('COMCAT_EMBEDDING_MODEL', 'all-MiniLM-L6-v2'),
        'top_n_recommendations': int(os.getenv('COMCAT_TOP_N', '5')),
        'min_similarity_threshold': float(os.getenv('COMCAT_MIN_SIMILARITY', '0.1')),
        'interest_cluster_min_size': int(os.getenv('COMCAT_CLUSTER_MIN_SIZE', '3')),
        'batch_size': int(os.getenv('COMCAT_BATCH_SIZE', '50'))
    }


if __name__ == "__main__":
    # Example usage and testing
    import sys
    
    logging.basicConfig(level=logging.INFO)
    
    # Create sample profiles for testing
    sample_profiles = [
        UserProfile(
            discord_user_id="user1",
            guild_id="guild1", 
            skills=["Python", "Machine Learning", "API Development"],
            interests=["AI", "Hackathons", "Open Source"],
            about_me="Love building AI-powered applications",
            project_history=[{"name": "ChatBot", "description": "AI chatbot for customer service"}],
            consent_status="opted_in"
        ),
        UserProfile(
            discord_user_id="user2",
            guild_id="guild1",
            skills=["JavaScript", "React", "UI/UX"],
            interests=["Web Development", "Design", "Hackathons"], 
            about_me="Frontend developer passionate about user experience",
            project_history=[{"name": "Dashboard", "description": "Analytics dashboard"}],
            consent_status="opted_in"
        ),
        UserProfile(
            discord_user_id="user3",
            guild_id="guild1",
            skills=["Python", "Data Science", "Visualization"],
            interests=["AI", "Data Analysis", "Research"],
            about_me="Data scientist exploring machine learning applications",
            project_history=[{"name": "Predictor", "description": "ML prediction model"}],
            consent_status="opted_in"
        )
    ]
    
    # Test the engine
    engine = create_community_catalyst_engine()
    
    # Generate recommendations
    recommendations = engine.generate_recommendations_batch(
        source_profiles=sample_profiles,
        target_profiles=sample_profiles,
        top_n_per_user=2
    )
    
    print(f"\nGenerated {len(recommendations)} recommendations:")
    for rec in recommendations:
        print(f"  {rec.source_discord_user_id} -> {rec.target_discord_user_id}")
        print(f"    Score: {rec.similarity_score:.3f}")
        print(f"    Reason: {rec.recommendation_reason}")
        print()
    
    # Test community analysis
    clusters = CommunityAnalyzer.identify_interest_clusters(sample_profiles)
    print(f"Interest clusters: {clusters}")
    
    topics = CommunityAnalyzer.suggest_meetup_topics(sample_profiles)
    print(f"Suggested meetup topics: {topics}")
