#!/usr/bin/env python3
"""
Test script for the enhanced AI Judging system
Demonstrates improved text segmentation using LLM and enhanced evaluation process
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path to import the AI judge
sys.path.append(str(Path(__file__).parent))

from ai_judge import AIJudge, JudgingCriteria

def test_enhanced_text_analysis():
    """Test the enhanced text analysis capabilities"""
    print("=== Testing Enhanced Text Analysis ===\n")
    
    # Sample project text for testing
    sample_text = """
    EcoSmart Waste Management System
    
    Problem Statement:
    Traditional waste management systems are inefficient and environmentally harmful. 
    Current methods result in 40% of recyclable materials being sent to landfills, 
    contributing to environmental pollution and resource waste.
    
    Methodology:
    Our solution uses IoT sensors and machine learning algorithms to optimize waste collection routes. 
    We implemented a Python-based backend with TensorFlow for route optimization and a React frontend 
    for real-time monitoring. The system processes data from 500+ sensors deployed across the city.
    
    Results:
    Initial testing shows 35% reduction in collection costs and 60% improvement in recycling rates. 
    The ML model achieved 87% accuracy in predicting optimal collection times. 
    Carbon emissions reduced by 25% through optimized routing.
    
    Conclusion:
    The EcoSmart system demonstrates significant potential for scalable waste management solutions. 
    Future work includes expanding to 10 additional cities and integrating blockchain for transparent 
    waste tracking. We plan to deploy the system using Docker containers on AWS infrastructure.
    """
    
    try:
        # Initialize AI judge
        judge = AIJudge()
        
        print("1. Testing Text Complexity Analysis:")
        complexity = judge.analyze_text_complexity(sample_text)
        for key, value in complexity.items():
            print(f"   {key}: {value}")
        
        print("\n2. Testing Technical Context Extraction:")
        tech_context = judge.extract_technical_context(sample_text)
        for key, value in tech_context.items():
            if value:
                print(f"   {key}: {value}")
        
        print("\n3. Testing LLM-based Text Segmentation:")
        sections = judge.segment_text(sample_text)
        for section_name, content in sections.items():
            if content:
                print(f"\n   {section_name.upper()}:")
                print(f"   {content[:150]}{'...' if len(content) > 150 else ''}")
        
        print("\n4. Testing Enhanced Evaluation Process:")
        print("   Running full evaluation (this may take a moment)...")
        
        result = judge.evaluate_project(sample_text, "TEST001")
        
        print(f"\n   Project ID: {result.project_id}")
        print(f"   Overall Score: {result.overall_score}/10")
        print(f"   Criteria Scores:")
        for criterion, score in result.criteria_scores.items():
            print(f"     {criterion}: {score}/10")
        
        print(f"\n   Summary: {result.summary}")
        
        print(f"\n   Strengths:")
        for strength in result.feedback.get('strengths', []):
            print(f"     • {strength}")
        
        print(f"\n   Weaknesses:")
        for weakness in result.feedback.get('weaknesses', []):
            print(f"     • {weakness}")
        
        print(f"\n   Enhanced Metadata:")
        for key, value in result.metadata.items():
            if key not in ['evaluation_timestamp', 'model_used']:
                print(f"     {key}: {value}")
        
        print("\n✅ Enhanced AI Judging System Test Completed Successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

def test_fallback_capabilities():
    """Test fallback capabilities when LLM is not available"""
    print("\n=== Testing Fallback Capabilities ===\n")
    
    # Test with a very short text that might trigger fallbacks
    short_text = "AI-powered chatbot for customer service. Uses natural language processing."
    
    try:
        judge = AIJudge()
        
        print("Testing with short text that may trigger fallback analysis:")
        print(f"Input text: {short_text}")
        
        # Test text analysis
        complexity = judge.analyze_text_complexity(short_text)
        print(f"\nComplexity analysis: {complexity}")
        
        # Test technical context
        tech_context = judge.extract_technical_context(short_text)
        print(f"Technical context: {tech_context}")
        
        # Test segmentation
        sections = judge.segment_text(short_text)
        print(f"Segmented sections: {len([s for s in sections.values() if s])} found")
        
        print("\n✅ Fallback Capabilities Test Completed!")
        
    except Exception as e:
        print(f"❌ Fallback test failed: {e}")

if __name__ == "__main__":
    print("🚀 Enhanced AI Judging System Test Suite")
    print("=" * 50)
    
    # Check if API key is available
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠️  No API key found. Set OPENROUTER_API_KEY or OPENAI_API_KEY environment variable.")
        print("   Some tests may fail or use fallback methods.")
        print()
    
    try:
        test_enhanced_text_analysis()
        test_fallback_capabilities()
        
        print("\n🎉 All tests completed!")
        print("\nKey Improvements Demonstrated:")
        print("• LLM-based text segmentation instead of keyword search")
        print("• Enhanced text complexity analysis")
        print("• Technical context extraction")
        print("• Improved evaluation prompts with context awareness")
        print("• Better fallback mechanisms")
        print("• Comprehensive metadata collection")
        
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()
