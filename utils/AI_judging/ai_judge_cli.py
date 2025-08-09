#!/usr/bin/env python3
"""
AI Judge CLI - Command-line interface for AI-powered project evaluation
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from ai_judge import AIJudge, JudgingCriteria, JudgingResult

def load_project_from_file(file_path: str) -> str:
    """Load project text from various file formats"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Project file not found: {file_path}")
    
    file_ext = Path(file_path).suffix.lower()
    
    if file_ext == '.json':
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Try to extract text from common JSON structures
            if isinstance(data, dict):
                if 'text' in data:
                    return data['text']
                elif 'description' in data:
                    return data['description']
                elif 'content' in data:
                    return data['content']
                elif 'project_description' in data:
                    return data['project_description']
                else:
                    # Return the entire JSON as text
                    return json.dumps(data, indent=2)
            else:
                return str(data)
    
    elif file_ext in ['.txt', '.md']:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    elif file_ext == '.csv':
        import pandas as pd
        df = pd.read_csv(file_path)
        # Try to find text columns
        text_columns = [col for col in df.columns if any(keyword in col.lower() 
                       for keyword in ['text', 'description', 'content', 'summary'])]
        if text_columns:
            return '\n\n'.join([f"{col}: {df[col].iloc[0]}" for col in text_columns])
        else:
            return df.to_string()
    
    else:
        # Try to read as text
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            raise ValueError(f"Cannot read file {file_path}. Please provide a text-based file.")

def load_custom_criteria(criteria_file: str) -> List[JudgingCriteria]:
    """Load custom judging criteria from JSON file"""
    with open(criteria_file, 'r', encoding='utf-8') as f:
        criteria_data = json.load(f)
    
    criteria = []
    for item in criteria_data:
        criteria.append(JudgingCriteria(
            name=item['name'],
            description=item['description'],
            weight=item.get('weight', 1.0),
            min_score=item.get('min_score', 0.0),
            max_score=item.get('max_score', 10.0)
        ))
    
    return criteria

def save_criteria_template(output_file: str = "judging_criteria_template.json"):
    """Save a template for custom judging criteria"""
    template = [
        {
            "name": "innovation",
            "description": "Measures originality, novelty, and creativity of the project",
            "weight": 1.2,
            "min_score": 0.0,
            "max_score": 10.0
        },
        {
            "name": "feasibility",
            "description": "Assesses technical and practical implementation possibility",
            "weight": 1.0,
            "min_score": 0.0,
            "max_score": 10.0
        },
        {
            "name": "presentation",
            "description": "Evaluates clarity, structure, and communication quality",
            "weight": 0.8,
            "min_score": 0.0,
            "max_score": 10.0
        },
        {
            "name": "impact",
            "description": "Measures potential social, economic, or scientific impact",
            "weight": 1.1,
            "min_score": 0.0,
            "max_score": 10.0
        },
        {
            "name": "technical_quality",
            "description": "Assesses technical sophistication and implementation",
            "weight": 1.0,
            "min_score": 0.0,
            "max_score": 10.0
        }
    ]
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(template, f, indent=2, ensure_ascii=False)
    
    print(f"Criteria template saved to {output_file}")

def print_result_summary(result: JudgingResult):
    """Print a formatted summary of judging results"""
    print("\n" + "="*60)
    print(f"JUDGING RESULTS FOR PROJECT: {result.project_id}")
    print("="*60)
    
    print(f"\n📊 OVERALL SCORE: {result.overall_score}/10")
    
    print(f"\n📋 CRITERIA SCORES:")
    for criterion, score in result.criteria_scores.items():
        print(f"  • {criterion.replace('_', ' ').title()}: {score}/10")
    
    print(f"\n📝 SUMMARY:")
    print(f"  {result.summary}")
    
    print(f"\n✅ STRENGTHS:")
    for strength in result.feedback.get('strengths', []):
        print(f"  • {strength}")
    
    print(f"\n🔧 AREAS FOR IMPROVEMENT (WEAKNESSES):")
    for weakness in result.feedback.get('weaknesses', []):
        print(f"  • {weakness}")
    
    if result.metadata:
        print(f"\n📋 METADATA:")
        for key, value in result.metadata.items():
            print(f"  • {key}: {value}")
    
    print("="*60)

def main():
    parser = argparse.ArgumentParser(
        description="AI Judge - AI-powered project evaluation system",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Evaluate a single project from text file
  python ai_judge_cli.py --project-file project.txt --project-id P001
  
  # Evaluate a project with custom criteria
  python ai_judge_cli.py --project-file project.json --criteria-file custom_criteria.json
  
  # Batch evaluate multiple projects
  python ai_judge_cli.py --batch-file projects.json --output-dir results
  
  # Create criteria template
  python ai_judge_cli.py --create-template
        """
    )
    
    # Input options
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument(
        '--project-file', '-f',
        help='Path to project file (txt, json, md, csv)'
    )
    input_group.add_argument(
        '--batch-file', '-b',
        help='Path to JSON file containing multiple projects'
    )
    input_group.add_argument(
        '--create-template',
        action='store_true',
        help='Create a template for custom judging criteria'
    )
    
    # Project identification
    parser.add_argument(
        '--project-id', '-i',
        default='P001',
        help='Project ID for single project evaluation (default: P001)'
    )
    
    # Custom criteria
    parser.add_argument(
        '--criteria-file', '-c',
        help='Path to custom judging criteria JSON file'
    )
    
    # Output options
    parser.add_argument(
        '--output-dir', '-o',
        default='judging_results',
        help='Output directory for results (default: judging_results)'
    )
    
    parser.add_argument(
        '--save-json', '-s',
        action='store_true',
        help='Save results as JSON files'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )
    
    args = parser.parse_args()
    
    # Handle template creation
    if args.create_template:
        save_criteria_template()
        return
    
    try:
        # Initialize AI Judge
        if args.verbose:
            print("Initializing AI Judge...")
        
        judge = AIJudge()
        
        if args.verbose:
            print(f"Using model: {judge.model}")
            print(f"API base URL: {judge.base_url}")
        
        # Load custom criteria if provided
        custom_criteria = None
        if args.criteria_file:
            if args.verbose:
                print(f"Loading custom criteria from {args.criteria_file}")
            custom_criteria = load_custom_criteria(args.criteria_file)
        
        # Single project evaluation
        if args.project_file:
            if args.verbose:
                print(f"Loading project from {args.project_file}")
            
            project_text = load_project_from_file(args.project_file)
            
            if args.verbose:
                print(f"Project text length: {len(project_text)} characters")
            
            # Evaluate project
            result = judge.evaluate_project(
                project_text=project_text,
                project_id=args.project_id,
                custom_criteria=custom_criteria
            )
            
            # Display results
            print_result_summary(result)
            
            # Save results if requested
            if args.save_json:
                os.makedirs(args.output_dir, exist_ok=True)
                output_file = os.path.join(args.output_dir, f"{result.project_id}_judging.json")
                judge.save_result(result, output_file)
        
        # Batch evaluation
        elif args.batch_file:
            if args.verbose:
                print(f"Loading batch projects from {args.batch_file}")
            
            with open(args.batch_file, 'r', encoding='utf-8') as f:
                projects_data = json.load(f)
            
            if not isinstance(projects_data, list):
                raise ValueError("Batch file must contain a list of projects")
            
            if args.verbose:
                print(f"Found {len(projects_data)} projects to evaluate")
            
            # Prepare projects list
            projects = []
            for project in projects_data:
                if isinstance(project, dict):
                    if 'text' in project:
                        projects.append(project)
                    elif 'file' in project:
                        # Load from file
                        project_text = load_project_from_file(project['file'])
                        projects.append({
                            'id': project.get('id', 'unknown'),
                            'text': project_text,
                            'metadata': project.get('metadata', {})
                        })
                    else:
                        print(f"Warning: Skipping project with missing 'text' or 'file': {project}")
                else:
                    print(f"Warning: Skipping invalid project format: {project}")
            
            if projects:
                # Run batch evaluation
                results = judge.batch_evaluate(projects, args.output_dir)
                
                print(f"\n✅ Batch evaluation completed!")
                print(f"Successfully evaluated {len(results)} projects")
                print(f"Results saved to: {args.output_dir}")
                
                # Print summary of all results
                print(f"\n📊 BATCH EVALUATION SUMMARY:")
                print("-" * 40)
                for result in results:
                    print(f"{result.project_id}: {result.overall_score}/10")
            else:
                print("No valid projects found for evaluation")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
