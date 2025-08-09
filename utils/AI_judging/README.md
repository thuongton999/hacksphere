# AI Judging System

An advanced AI-powered system for evaluating competition projects, hackathon submissions, and technical proposals using Large Language Models (LLMs).

## 🚀 Key Features

### Enhanced Text Analysis
- **LLM-based Text Segmentation**: Uses AI to intelligently segment project text into logical sections (problem statement, methodology, results, conclusion) instead of relying on keyword search
- **Text Complexity Analysis**: Analyzes text structure, technical terms, and complexity indicators
- **Technical Context Extraction**: Identifies domains, technologies, methodologies, and performance metrics
- **Smart Fallback Mechanisms**: Intelligent fallback analysis when LLM processing fails

### Advanced Evaluation Process
- **Context-Aware Scoring**: Evaluation considers text complexity, technical context, and domain-specific factors
- **Enhanced Prompt Engineering**: Comprehensive prompts with detailed evaluation criteria and context
- **Robust JSON Parsing**: Advanced JSON extraction and validation with fallback mechanisms
- **Comprehensive Metadata**: Rich metadata collection for analysis and tracking

### Intelligent Scoring System
- **Weighted Criteria**: Customizable judging criteria with configurable weights
- **Score Normalization**: Consistent 0-10 scale with proper rounding and validation
- **Evidence-Based Feedback**: Specific strengths and weaknesses with actionable suggestions
- **Quality Assurance**: Multiple validation layers ensure consistent output quality

## 🏗️ Architecture

```
Project Text → Preprocessing → LLM Segmentation → Feature Extraction → AI Evaluation → Validation → Structured Output
     ↓              ↓              ↓                ↓              ↓           ↓           ↓
Text Cleaning   LLM-based    Technical Context  Enhanced      Score      Fallback    JSON Result
                Sections     & Complexity      Prompts      Normalization  Validation  + Metadata
```

## 📋 Requirements

### Python Dependencies
```bash
pip install -r requirements.txt
```

### Environment Variables
```bash
# Required: Set one of these API keys
export OPENROUTER_API_KEY="your_openrouter_api_key"
# OR
export OPENAI_API_KEY="your_openai_api_key"

# Optional: Customize API endpoints
export OPENAI_API_BASE="https://openrouter.ai/api/v1"
export OPENROUTER_MODEL="qwen/qwen3-30b-a3b-instruct-2507"
```

## 🎯 Usage

### Basic Project Evaluation

```python
from ai_judge import AIJudge

# Initialize the judge
judge = AIJudge()

# Evaluate a project
result = judge.evaluate_project(
    project_text="Your project description here...",
    project_id="P001"
)

# Access results
print(f"Overall Score: {result.overall_score}/10")
print(f"Criteria Scores: {result.criteria_scores}")
print(f"Summary: {result.summary}")
print(f"Strengths: {result.feedback['strengths']}")
print(f"Weaknesses: {result.feedback['weaknesses']}")
```

### Custom Judging Criteria

```python
from ai_judge import AIJudge, JudgingCriteria

# Define custom criteria
custom_criteria = [
    JudgingCriteria("creativity", "Measures originality and innovative thinking", 1.5),
    JudgingCriteria("technical_implementation", "Assesses code quality and architecture", 1.2),
    JudgingCriteria("user_experience", "Evaluates usability and design", 1.0),
    JudgingCriteria("market_potential", "Considers business viability", 0.8)
]

# Use custom criteria for evaluation
judge = AIJudge()
result = judge.evaluate_project(
    project_text="Project description...",
    project_id="P002",
    custom_criteria=custom_criteria
)
```

### Batch Evaluation

```python
# Evaluate multiple projects
projects = [
    {"id": "P001", "text": "Project 1 description..."},
    {"id": "P002", "text": "Project 2 description..."},
    {"id": "P003", "text": "Project 3 description..."}
]

results = judge.batch_evaluate(projects, output_dir="judging_results")
```

## 🔧 Advanced Features

### Text Complexity Analysis

```python
# Analyze text complexity and structure
complexity = judge.analyze_text_complexity(project_text)
print(f"Word Count: {complexity['word_count']}")
print(f"Technical Terms: {complexity['technical_terms']}")
print(f"Complexity Score: {complexity['complexity_score']}/10")
```

### Technical Context Extraction

```python
# Extract technical context and domain information
context = judge.extract_technical_context(project_text)
print(f"Domains: {context['domains']}")
print(f"Technologies: {context['technologies']}")
print(f"Methodologies: {context['methodologies']}")
```

### Enhanced Metadata

```python
# Access comprehensive evaluation metadata
metadata = result.metadata
print(f"Evaluation Method: {metadata['evaluation_method']}")
print(f"Text Complexity: {metadata['text_complexity']}")
print(f"Technical Context: {metadata['technical_context']}")
print(f"Sections Analyzed: {metadata['sections_found']}")
```

## 📊 Output Format

### JudgingResult Structure

```json
{
  "project_id": "P001",
  "criteria_scores": {
    "innovation": 8.5,
    "feasibility": 7.0,
    "presentation": 6.5,
    "impact": 8.0,
    "technical_quality": 7.5
  },
  "overall_score": 7.5,
  "summary": "This project demonstrates strong innovation and technical quality...",
  "feedback": {
    "strengths": [
      "Highly original approach using advanced technologies",
      "Clear technical implementation with modern frameworks"
    ],
    "weaknesses": [
      "Could benefit from more detailed deployment roadmap",
      "Consider adding performance benchmarks and testing results"
    ]
  },
  "metadata": {
    "evaluation_method": "llm_enhanced",
    "text_complexity": {
      "word_count": 450,
      "complexity_score": 7.5
    },
    "technical_context": {
      "domains": ["AI/ML", "Web Development"],
      "technologies": ["Python", "TensorFlow", "React"]
    }
  }
}
```

## 🧪 Testing

### Run Enhanced Test Suite

```bash
# Test the enhanced AI judging system
python test_enhanced_judge.py
```

### Test Individual Components

```bash
# Test basic functionality
python test_ai_judge.py

# Test CLI interface
python ai_judge_cli.py --help
python ai_judge_cli.py evaluate sample_project.txt
```

## 🔄 CLI Usage

### Single Project Evaluation

```bash
python ai_judge_cli.py evaluate project_description.txt
```

### Batch Evaluation

```bash
python ai_judge_cli.py batch projects_directory/
```

### Custom Output Directory

```bash
python ai_judge_cli.py evaluate project.txt --output-dir custom_results/
```

## 🎨 Customization

### Modifying Judging Criteria

Edit `config.py` to customize default criteria, weights, and descriptions:

```python
default_criteria = [
    JudgingCriteria("innovation", "Your custom description", 1.2),
    JudgingCriteria("feasibility", "Your custom description", 1.0),
    # Add more criteria...
]
```

### Adjusting AI Model Parameters

Modify the `evaluate_project` method in `ai_judge.py`:

```python
completion = self.client.chat.completions.create(
    model=self.model,
    temperature=0.1,        # Adjust for creativity vs consistency
    max_tokens=2000,        # Increase for longer responses
    top_p=0.9,             # Adjust response diversity
    # ... other parameters
)
```

## 🚨 Error Handling

The system includes robust error handling:

- **LLM Failures**: Automatic fallback to intelligent rule-based scoring
- **JSON Parsing Errors**: Advanced JSON extraction with validation
- **API Issues**: Graceful degradation with informative error messages
- **Invalid Input**: Input validation and sanitization

## 📈 Performance Considerations

- **Token Limits**: Text is automatically truncated to avoid API limits
- **Batch Processing**: Efficient batch evaluation for multiple projects
- **Caching**: Results are saved to disk for future reference
- **Fallback Mechanisms**: Fast fallback scoring when AI evaluation fails

## 🔮 Future Enhancements

- **Multi-language Support**: Evaluation in different languages
- **Domain-specific Models**: Specialized models for different competition types
- **Real-time Evaluation**: Live evaluation during competitions
- **Advanced Analytics**: Statistical analysis of judging patterns
- **Integration APIs**: REST API for platform integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the error messages and logs
2. Review the configuration settings
3. Ensure API keys are properly set
4. Test with the provided sample data
5. Open an issue with detailed error information
