#!/usr/bin/env python3
"""
Test script for AI Judge system
"""

import os
import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

def test_ai_judge_import():
    """Test that AI Judge can be imported correctly"""
    try:
        from ai_judge import AIJudge, JudgingCriteria, JudgingResult
        print("✅ Successfully imported AI Judge components")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_config_import():
    """Test that configuration can be imported correctly"""
    try:
        from config import DEFAULT_CRITERIA, get_criteria_for_competition_type
        print("✅ Successfully imported configuration")
        return True
    except ImportError as e:
        print(f"❌ Config import failed: {e}")
        return False

def test_ai_judge_initialization():
    """Test AI Judge initialization"""
    try:
        from ai_judge import AIJudge
        
        # Check if API key is available
        api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("⚠️  No API key found - skipping initialization test")
            return True
        
        judge = AIJudge()
        print("✅ AI Judge initialized successfully")
        print(f"   Model: {judge.model}")
        print(f"   Base URL: {judge.base_url}")
        return True
        
    except Exception as e:
        print(f"❌ AI Judge initialization failed: {e}")
        return False

def test_text_processing():
    """Test text processing functions"""
    try:
        from ai_judge import AIJudge
        
        judge = AIJudge()
        
        # Test text preprocessing
        test_text = "<p>This is a <b>test</b> project with emojis 🚀 and formatting!</p>"
        cleaned_text = judge.preprocess_text(test_text)
        
        if "<p>" not in cleaned_text and "<b>" not in cleaned_text:
            print("✅ Text preprocessing works correctly")
        else:
            print("❌ Text preprocessing failed")
            return False
        
        # Test keyword extraction
        keywords = judge.extract_keywords(cleaned_text, top_k=5)
        if keywords and len(keywords) > 0:
            print("✅ Keyword extraction works correctly")
        else:
            print("❌ Keyword extraction failed")
            return False
        
        # Test text segmentation
        sections = judge.segment_text(cleaned_text)
        if isinstance(sections, dict) and len(sections) > 0:
            print("✅ Text segmentation works correctly")
        else:
            print("❌ Text segmentation failed")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Text processing test failed: {e}")
        return False

def test_sample_project():
    """Test with the sample project file"""
    try:
        sample_file = Path(__file__).parent / "sample_project.txt"
        if not sample_file.exists():
            print("⚠️  Sample project file not found - skipping test")
            return True
        
        from ai_judge import AIJudge
        
        # Check if API key is available
        api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("⚠️  No API key found - skipping sample project test")
            return True
        
        judge = AIJudge()
        
        # Load sample project
        with open(sample_file, 'r', encoding='utf-8') as f:
            project_text = f.read()
        
        print(f"📄 Loaded sample project ({len(project_text)} characters)")
        
        # Test evaluation (this will make an API call)
        print("🤖 Evaluating sample project with AI...")
        result = judge.evaluate_project(
            project_text=project_text,
            project_id="TEST001"
        )
        
        print("✅ Sample project evaluation completed!")
        print(f"   Overall Score: {result.overall_score}/10")
        print(f"   Criteria Scores: {result.criteria_scores}")
        print(f"   Summary: {result.summary[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Sample project test failed: {e}")
        return False

def test_cli_help():
    """Test that CLI shows help correctly"""
    try:
        import subprocess
        result = subprocess.run([
            sys.executable, 
            str(Path(__file__).parent / "ai_judge_cli.py"), 
            "--help"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0 and "AI Judge" in result.stdout:
            print("✅ CLI help command works correctly")
            return True
        else:
            print("❌ CLI help command failed")
            return False
            
    except Exception as e:
        print(f"❌ CLI test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing AI Judge System")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_ai_judge_import),
        ("Config Import Test", test_config_import),
        ("AI Judge Initialization", test_ai_judge_initialization),
        ("Text Processing Test", test_text_processing),
        ("Sample Project Test", test_sample_project),
        ("CLI Help Test", test_cli_help)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        try:
            if test_func():
                passed += 1
            else:
                print(f"   ❌ {test_name} failed")
        except Exception as e:
            print(f"   ❌ {test_name} crashed: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! AI Judge system is ready to use.")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
