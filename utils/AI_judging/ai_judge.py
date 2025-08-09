import os
import json
import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from openai import OpenAI
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from keybert import KeyBERT

@dataclass
class JudgingCriteria:
    """Definition of judging criteria with weights and descriptions"""
    name: str
    description: str
    weight: float = 1.0
    min_score: float = 0.0
    max_score: float = 10.0

@dataclass
class JudgingResult:
    """Structured output from AI judging"""
    project_id: str
    criteria_scores: Dict[str, float]
    overall_score: float
    summary: str
    feedback: Dict[str, List[str]]
    metadata: Dict[str, Any]

class AIJudge:
    """Main AI judging system for competition projects"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """Initialize the AI judge with OpenAI client"""
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise RuntimeError("Missing OPENROUTER_API_KEY or OPENAI_API_KEY in environment.")
        
        self.base_url = base_url or os.getenv("OPENAI_API_BASE", os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1"))
        self.model = os.getenv("OPENROUTER_MODEL", "qwen/qwen3-30b-a3b-instruct-2507")
        
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )
        
        # Initialize KeyBERT for keyword extraction
        try:
            self.keyword_extractor = KeyBERT()
        except:
            self.keyword_extractor = None
        
        # Default judging criteria with detailed descriptions for better AI evaluation
        self.default_criteria = [
            JudgingCriteria("innovation", "Measures originality, novelty, and creativity of the project. Consider: Does this approach something in a new way? Is the solution creative and unique? Does it demonstrate breakthrough thinking?", 1.2),
            JudgingCriteria("feasibility", "Assesses technical and practical implementation possibility. Consider: Are the technical requirements realistic? Is there a clear implementation path? Are the resources and timeline reasonable?", 1.0),
            JudgingCriteria("presentation", "Evaluates clarity, structure, and communication quality. Consider: Is the project clearly explained? Is the structure logical and easy to follow? Are key points communicated effectively?", 0.8),
            JudgingCriteria("impact", "Measures potential social, economic, or scientific impact. Consider: Who will benefit from this project? What is the scale of potential impact? Is the value proposition clear and compelling?", 1.1),
            JudgingCriteria("technical_quality", "Assesses technical sophistication and implementation. Consider: Is the technical approach sound? Are there appropriate technical details? Is the implementation well-thought-out?", 1.0)
        ]
    
    def preprocess_text(self, text: str) -> str:
        """Clean and normalize input text for better AI analysis"""
        if not text or not isinstance(text, str):
            return ""
        
        # Remove HTML tags and entities
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'&[a-zA-Z]+;', '', text)
        
        # Remove emojis and special characters while preserving important punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\-\:\;\(\)\[\]\{\}\"\'\`\~@#$%^&*+=|\\/<>]', '', text)
        
        # Normalize whitespace and line breaks
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', ' ', text)
        text = text.strip()
        
        # Normalize numbers, percentages, and currency
        text = re.sub(r'(\d+)\s*%', r'\1 percent', text)
        text = re.sub(r'(\d+)\s*\$', r'$\1', text)
        text = re.sub(r'\$\s*(\d+)', r'$\1', text)
        
        # Normalize common abbreviations and technical terms
        text = re.sub(r'\bAI\b', 'artificial intelligence', text, flags=re.IGNORECASE)
        text = re.sub(r'\bML\b', 'machine learning', text, flags=re.IGNORECASE)
        text = re.sub(r'\bAPI\b', 'API', text)
        text = re.sub(r'\bUI\b', 'user interface', text, flags=re.IGNORECASE)
        text = re.sub(r'\bUX\b', 'user experience', text, flags=re.IGNORECASE)
        
        # Remove excessive punctuation
        text = re.sub(r'[\.]{2,}', '.', text)
        text = re.sub(r'[\!]{2,}', '!', text)
        text = re.sub(r'[\?]{2,}', '?', text)
        
        return text
    
    def segment_text(self, text: str) -> Dict[str, str]:
        """Use LLM to intelligently segment text into logical sections for better AI analysis"""
        sections = {
            "problem_statement": "",
            "methodology": "",
            "results": "",
            "conclusion": ""
        }
        
        # Use LLM for intelligent text segmentation
        try:
            segmentation_prompt = f"""You are an expert at analyzing project reports and technical documents. Your task is to segment the following text into logical sections.

TEXT TO ANALYZE:
{text[:3000]}  # Limit to first 3000 chars to avoid token limits

INSTRUCTIONS:
1. Analyze the text structure and identify the main sections
2. For each section, extract the most relevant content that represents that section
3. If a section is not clearly present, provide a brief summary of what that section would contain based on the available content
4. Focus on extracting meaningful, coherent content rather than arbitrary text splits

REQUIRED SECTIONS:
- problem_statement: What problem/challenge does this project address? What is the need or goal?
- methodology: What approach, technique, or method is used? How is it implemented?
- results: What outcomes, achievements, or performance metrics are shown?
- conclusion: What are the key takeaways, future work, or next steps?

OUTPUT FORMAT (JSON):
{{
    "problem_statement": "extracted or inferred problem statement content",
    "methodology": "extracted or inferred methodology content", 
    "results": "extracted or inferred results content",
    "conclusion": "extracted or inferred conclusion content"
}}

IMPORTANT: Respond ONLY with valid JSON. Do not include any other text or explanations."""

            completion = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": os.getenv("OPENROUTER_HTTP_REFERER", "http://localhost"),
                    "X-Title": os.getenv("OPENROUTER_X_TITLE", "AIJudge"),
                },
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a text analysis expert. Always respond with valid JSON format only."},
                    {"role": "user", "content": segmentation_prompt}
                ],
                temperature=0.1,
                max_tokens=800,
                top_p=0.9
            )
            
            response_text = completion.choices[0].message.content
            
            # Extract JSON from response
            try:
                llm_sections = json.loads(response_text)
                for key in sections:
                    if key in llm_sections and llm_sections[key]:
                        sections[key] = llm_sections[key].strip()
            except json.JSONDecodeError:
                # Fallback to intelligent text splitting if LLM fails
                sections = self._fallback_text_segmentation(text)
                
        except Exception as e:
            # Fallback to intelligent text splitting if LLM fails
            print(f"LLM segmentation failed: {e}. Using fallback segmentation.")
            sections = self._fallback_text_segmentation(text)
        
        return sections
    
    def _fallback_text_segmentation(self, text: str) -> Dict[str, str]:
        """Intelligent fallback text segmentation when LLM fails"""
        sections = {
            "problem_statement": "",
            "methodology": "",
            "results": "",
            "conclusion": ""
        }
        
        text_length = len(text)
        if text_length < 100:
            # Very short text - assign everything to problem statement
            sections["problem_statement"] = text
            return sections
        
        # Intelligent text splitting based on content analysis
        # Look for natural break points and semantic indicators
        
        # Problem statement: Usually at the beginning, look for context clues
        problem_indicators = ["problem", "challenge", "issue", "need", "goal", "objective", "aim", "purpose", "solve", "address", "background", "introduction"]
        problem_end = self._find_section_boundary(text, problem_indicators, 0, text_length // 3)
        
        if problem_end > 0:
            sections["problem_statement"] = text[:problem_end].strip()
        
        # Methodology: Look for technical approach details
        method_indicators = ["method", "approach", "technique", "algorithm", "process", "implementation", "design", "architecture", "framework", "model", "system", "solution"]
        method_start = max(0, problem_end - 50) if problem_end > 0 else text_length // 4
        method_end = self._find_section_boundary(text, method_indicators, method_start, 2 * text_length // 3)
        
        if method_end > method_start:
            sections["methodology"] = text[method_start:method_end].strip()
        
        # Results: Look for outcomes and achievements
        results_indicators = ["result", "outcome", "achievement", "performance", "accuracy", "efficiency", "success", "validation", "test", "evaluation", "achieved", "obtained"]
        results_start = max(0, method_end - 50) if method_end > method_start else 2 * text_length // 3
        results_end = self._find_section_boundary(text, results_indicators, results_start, text_length)
        
        if results_end > results_start:
            sections["results"] = text[results_start:results_end].strip()
        
        # Conclusion: Look for summary and future work
        conclusion_indicators = ["conclusion", "summary", "future", "next", "improvement", "enhancement", "scalability", "deployment", "recommendation", "outlook"]
        conclusion_start = max(0, results_end - 50) if results_end > results_start else 3 * text_length // 4
        
        if conclusion_start < text_length:
            sections["conclusion"] = text[conclusion_start:].strip()
        
        # If any section is empty, fill with intelligent content
        sections = self._fill_empty_sections(text, sections)
        
        return sections
    
    def _find_section_boundary(self, text: str, indicators: List[str], start_pos: int, end_pos: int) -> int:
        """Find the end boundary of a section based on indicators"""
        text_segment = text[start_pos:end_pos].lower()
        
        for indicator in indicators:
            pos = text_segment.find(indicator)
            if pos != -1:
                # Look for sentence or paragraph boundaries after the indicator
                actual_pos = start_pos + pos
                # Find the next sentence boundary (period, exclamation, question mark)
                for i in range(actual_pos + len(indicator), min(len(text), actual_pos + 300)):
                    if text[i] in '.!?':
                        return i + 1
                # If no sentence boundary found, return position after indicator
                return actual_pos + len(indicator) + 100
        
        return end_pos
    
    def _fill_empty_sections(self, text: str, sections: Dict[str, str]) -> Dict[str, str]:
        """Fill empty sections with intelligent content based on available text"""
        text_length = len(text)
        
        # If problem statement is empty, use the beginning
        if not sections["problem_statement"]:
            sections["problem_statement"] = text[:text_length // 4].strip()
        
        # If methodology is empty, use the middle section
        if not sections["methodology"]:
            start = text_length // 4
            end = text_length // 2
            sections["methodology"] = text[start:end].strip()
        
        # If results is empty, use the third quarter
        if not sections["results"]:
            start = text_length // 2
            end = 3 * text_length // 4
            sections["results"] = text[start:end].strip()
        
        # If conclusion is empty, use the end
        if not sections["conclusion"]:
            start = 3 * text_length // 4
            sections["conclusion"] = text[start:].strip()
        
        return sections
    
    def extract_keywords(self, text: str, top_k: int = 15) -> List[str]:
        """Extract important keywords using TF-IDF or KeyBERT for better AI context"""
        if self.keyword_extractor:
            try:
                keywords = self.keyword_extractor.extract_keywords(text, top_k=top_k)
                return [keyword for keyword, score in keywords]
            except:
                pass
        
        # Fallback to TF-IDF with better preprocessing
        try:
            # Remove common stop words and technical terms that don't add value
            custom_stop_words = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall']
            
            vectorizer = TfidfVectorizer(
                max_features=top_k * 2,  # Get more features initially
                stop_words=custom_stop_words,
                ngram_range=(1, 2),  # Include bigrams for technical terms
                min_df=1,
                max_df=0.95
            )
            vectorizer.fit([text])
            feature_names = vectorizer.get_feature_names_out()
            
            # Filter for technical and meaningful terms
            technical_terms = []
            for term in feature_names:
                if len(term) > 3 and not term.isdigit():
                    # Prioritize technical terms
                    if any(tech_word in term.lower() for tech_word in ['algorithm', 'model', 'system', 'data', 'analysis', 'method', 'approach', 'technology', 'solution', 'platform', 'framework', 'architecture', 'api', 'database', 'machine', 'learning', 'artificial', 'intelligence', 'blockchain', 'cloud', 'mobile', 'web', 'app', 'software', 'hardware', 'network', 'security', 'performance', 'optimization', 'scalability', 'efficiency', 'accuracy', 'validation', 'testing', 'deployment', 'integration']):
                        technical_terms.append(term)
                    elif len(technical_terms) < top_k:
                        technical_terms.append(term)
            
            return technical_terms[:top_k]
            
        except Exception as e:
            # Enhanced fallback with better word filtering
            words = re.findall(r'\b\w+\b', text.lower())
            word_freq = {}
            
            # Filter for meaningful words
            for word in words:
                if len(word) > 3 and word not in ['this', 'that', 'with', 'from', 'they', 'have', 'will', 'would', 'could', 'should', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'there', 'could', 'would', 'make', 'like', 'into', 'him', 'time', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part']:
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            # Sort by frequency and return top keywords
            sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            return [word for word, freq in sorted_words[:top_k]]
    
    def create_evaluation_prompt(self, text: str, criteria: List[JudgingCriteria], 
                               sections: Dict[str, str], keywords: List[str],
                               complexity_analysis: Dict[str, Any],
                               technical_context: Dict[str, Any]) -> str:
        """Create a comprehensive evaluation prompt for better AI analysis with enhanced context"""
        
        # Build section summaries for better context
        section_summary = ""
        for section_name, content in sections.items():
            if content:
                # Truncate long sections to avoid token limits
                truncated_content = content[:500] + "..." if len(content) > 500 else content
                section_summary += f"\n{section_name.upper()}:\n{truncated_content}\n"
        
        # Build complexity analysis summary
        complexity_summary = f"""
TEXT COMPLEXITY ANALYSIS:
- Word Count: {complexity_analysis.get('word_count', 0)}
- Sentence Count: {complexity_analysis.get('sentence_count', 0)}
- Technical Terms: {complexity_analysis.get('technical_terms', 0)}
- Structure Indicators: {complexity_analysis.get('structure_indicators', 0)}
- Complexity Score: {complexity_analysis.get('complexity_score', 0.0)}/10
"""
        
        # Build technical context summary
        technical_summary = ""
        if technical_context.get('domains'):
            technical_summary += f"\nIDENTIFIED DOMAINS: {', '.join(technical_context['domains'])}"
        if technical_context.get('technologies'):
            technical_summary += f"\nTECHNOLOGIES MENTIONED: {', '.join(technical_context['technologies'][:8])}"
        if technical_context.get('methodologies'):
            technical_summary += f"\nMETHODOLOGIES: {', '.join(technical_context['methodologies'])}"
        if technical_context.get('metrics'):
            technical_summary += f"\nPERFORMANCE METRICS: {', '.join(technical_context['metrics'][:5])}"
        if technical_context.get('challenges'):
            technical_summary += f"\nIDENTIFIED CHALLENGES: {'; '.join(technical_context['challenges'][:3])}"
        
        # Create detailed evaluation prompt
        prompt = f"""You are an expert competition judge with deep expertise in evaluating innovative projects, technical solutions, and business proposals. Your task is to provide a comprehensive, evidence-based evaluation of the following project.

PROJECT TEXT:
{text[:2000]}  # Limit to avoid token limits

TEXT SECTIONS ANALYSIS:
{section_summary}

TEXT COMPLEXITY AND STRUCTURE:
{complexity_summary}

TECHNICAL CONTEXT AND DOMAIN ANALYSIS:
{technical_summary}

KEY TECHNICAL TERMS AND CONCEPTS:
{', '.join(keywords[:20])}  # Limit keywords for clarity

EVALUATION CRITERIA:
"""
        
        for criterion in criteria:
            prompt += f"""
- {criterion.name.upper()} (Weight: {criterion.weight}):
  {criterion.description}
  Score Range: {criterion.min_score}-{criterion.max_score}"""
        
        prompt += f"""

EVALUATION INSTRUCTIONS:
1. **Comprehensive Analysis**: Carefully analyze each section of the project text, considering the context, complexity, and technical details provided.

2. **Evidence-Based Scoring**: For each criterion, provide a score based on:
   - Specific evidence from the text
   - Technical merit and innovation
   - Practical feasibility and implementation quality
   - Clear reasoning for your assessment
   - Consider the text complexity and technical context provided

3. **Detailed Feedback**: Provide specific, actionable feedback that identifies:
   - Concrete strengths with examples from the text
   - Specific weaknesses or areas for improvement with suggestions
   - Evidence-based observations rather than general statements
   - Consider the identified domains and technologies in your feedback

4. **Professional Assessment**: Maintain an objective, constructive tone throughout the evaluation.

5. **Balanced Perspective**: Consider both the project's current state and its potential, weighing innovation against feasibility.

6. **Context-Aware Evaluation**: Use the provided complexity analysis and technical context to inform your assessment:
   - Higher complexity scores may indicate more sophisticated projects
   - Technical context helps identify domain-specific strengths and challenges
   - Structure indicators suggest organization and presentation quality

EVALUATION TASK:
Analyze the project and provide:

1. **Criteria Scores**: Assign a score (0-10) for each criterion with brief justification
2. **Project Summary**: A 2-3 sentence overview of what the project does and its significance
3. **Strengths**: 3-5 specific strengths with evidence from the text
4. **Weaknesses**: 3-5 specific areas for improvement with constructive suggestions

OUTPUT FORMAT (JSON ONLY):
{{
    "criteria_scores": {{
        "innovation": 8.5,
        "feasibility": 7.0,
        "presentation": 6.5,
        "impact": 8.0,
        "technical_quality": 7.5
    }},
    "summary": "Brief project overview and significance",
    "strengths": [
        "Specific strength with evidence from text",
        "Another strength with supporting detail"
    ],
    "weaknesses": [
        "Specific weakness with improvement suggestion",
        "Another area for improvement with actionable advice"
    ]
}}

IMPORTANT: 
- Respond ONLY with valid JSON format
- Base all scores and feedback on evidence from the provided text
- Consider the complexity analysis and technical context in your evaluation
- Ensure scores are realistic and justified
- Provide specific, actionable feedback rather than general statements
- Focus on the project's technical and business merits"""
        
        return prompt
    
    def _extract_and_validate_json(self, response_text: str) -> Dict[str, Any]:
        """Extract and validate JSON from AI response with fallback handling"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                ai_output = json.loads(json_str)
                
                # Validate required fields
                required_fields = ["criteria_scores", "summary", "strengths", "weaknesses"]
                missing_fields = [field for field in required_fields if field not in ai_output]
                
                if missing_fields:
                    print(f"Warning: Missing fields in AI response: {missing_fields}")
                    # Try to fix common issues
                    if "criteria_scores" not in ai_output:
                        ai_output["criteria_scores"] = {}
                    if "summary" not in ai_output:
                        ai_output["summary"] = "Project evaluation completed."
                    if "strengths" not in ai_output:
                        ai_output["strengths"] = []
                    if "weaknesses" not in ai_output:
                        ai_output["weaknesses"] = []
                
                return ai_output
            else:
                raise ValueError("No JSON found in AI response")
                
        except Exception as e:
            print(f"JSON extraction failed: {e}")
            # Return a structured fallback
            return {
                "criteria_scores": {},
                "summary": "Project evaluation completed with fallback processing.",
                "strengths": ["Project demonstrates clear objectives"],
                "weaknesses": ["Consider providing more detailed technical specifications"]
            }
    
    def evaluate_project(self, project_text: str, project_id: str = "P001", 
                        custom_criteria: Optional[List[JudgingCriteria]] = None,
                        metadata: Optional[Dict[str, Any]] = None) -> JudgingResult:
        """Main method to evaluate a project and return structured results with enhanced analysis"""
        
        # Step 1: Enhanced preprocessing with better text analysis
        cleaned_text = self.preprocess_text(project_text)
        
        # Step 2: Advanced feature extraction using LLM and text analysis
        sections = self.segment_text(cleaned_text)
        keywords = self.extract_keywords(cleaned_text)
        
        # Step 3: Enhanced text analysis for better context
        complexity_analysis = self.analyze_text_complexity(cleaned_text)
        technical_context = self.extract_technical_context(cleaned_text)
        
        # Step 4: Use custom criteria or defaults
        criteria = custom_criteria or self.default_criteria
        
        # Step 5: Create comprehensive evaluation prompt with enhanced context
        prompt = self.create_evaluation_prompt(cleaned_text, criteria, sections, keywords, 
                                             complexity_analysis, technical_context)
        
        # Step 6: Enhanced AI evaluation with better prompting
        try:
            # First pass: Get initial evaluation
            completion = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": os.getenv("OPENROUTER_HTTP_REFERER", "http://localhost"),
                    "X-Title": os.getenv("OPENROUTER_X_TITLE", "AIJudge"),
                },
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert competition judge specializing in technical project evaluation. Provide detailed, evidence-based assessments with specific scores and constructive feedback. Always respond with valid JSON format. Focus on technical merit, innovation, feasibility, and practical impact."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Very low temperature for consistent, focused evaluation
                max_tokens=2000,  # Increased for more detailed feedback
                top_p=0.9,  # Focus on most relevant responses
                frequency_penalty=0.1,  # Slight penalty for repetitive language
                presence_penalty=0.1,  # Encourage comprehensive coverage
                response_format={"type": "json_object"}  # Ensure JSON output
            )
            
            response_text = completion.choices[0].message.content
            
            # Extract and validate JSON from response
            ai_output = self._extract_and_validate_json(response_text)
            
            # Step 7: Enhanced validation and refinement
            ai_output = self._validate_and_refine_evaluation(ai_output, criteria, cleaned_text)
            
        except Exception as e:
            # Enhanced fallback scoring if AI fails
            print(f"AI evaluation failed: {e}. Using enhanced fallback scoring.")
            ai_output = self._enhanced_fallback_scoring(cleaned_text, criteria, sections, keywords)
        
        # Step 8: Advanced score normalization and calculation
        criteria_scores = ai_output.get("criteria_scores", {})
        normalized_scores = self._normalize_scores(criteria_scores, criteria)
        
        # Calculate weighted overall score with confidence metrics
        overall_score = self._calculate_overall_score(normalized_scores, criteria)
        
        # Step 9: Create enhanced result with comprehensive metadata
        result = JudgingResult(
            project_id=project_id,
            criteria_scores=normalized_scores,
            overall_score=overall_score,
            summary=ai_output.get("summary", "Project evaluation completed with enhanced analysis."),
            feedback={
                "strengths": ai_output.get("strengths", []),
                "weaknesses": ai_output.get("weaknesses", [])
            },
            metadata={
                **(metadata or {}),
                "evaluation_method": "llm_enhanced",
                "text_sections_analyzed": len([s for s in sections.values() if s]),
                "keywords_extracted": len(keywords),
                "evaluation_timestamp": self._get_timestamp(),
                "model_used": self.model,
                "text_complexity": complexity_analysis,
                "technical_context": technical_context,
                "text_length": len(cleaned_text),
                "sections_found": {k: len(v) for k, v in sections.items() if v}
            }
        )
        
        return result
    
    def _validate_and_refine_evaluation(self, ai_output: Dict[str, Any], 
                                      criteria: List[JudgingCriteria], 
                                      text: str) -> Dict[str, Any]:
        """Validate and refine AI evaluation output for consistency and quality"""
        
        # Validate criteria scores
        validated_scores = {}
        for criterion in criteria:
            score = ai_output.get("criteria_scores", {}).get(criterion.name, 5.0)
            try:
                score = float(score)
                # Clamp to valid range
                score = max(criterion.min_score, min(criterion.max_score, score))
                validated_scores[criterion.name] = round(score, 1)
            except (ValueError, TypeError):
                validated_scores[criterion.name] = 5.0
        
        # Validate and enhance feedback
        strengths = ai_output.get("strengths", [])
        weaknesses = ai_output.get("weaknesses", [])
        
        # Ensure feedback is specific and actionable
        if not strengths or len(strengths) < 2:
            strengths = self._generate_fallback_strengths(text, validated_scores)
        
        if not weaknesses or len(weaknesses) < 2:
            weaknesses = self._generate_fallback_weaknesses(text, validated_scores)
        
        # Validate summary
        summary = ai_output.get("summary", "")
        if not summary or len(summary) < 20:
            summary = self._generate_fallback_summary(text, validated_scores)
        
        return {
            "criteria_scores": validated_scores,
            "summary": summary,
            "strengths": strengths[:5],  # Limit to top 5
            "weaknesses": weaknesses[:5]  # Limit to top 5
        }
    
    def _generate_fallback_strengths(self, text: str, scores: Dict[str, float]) -> List[str]:
        """Generate fallback strengths based on high-scoring criteria"""
        strengths = []
        text_lower = text.lower()
        
        # Generate strengths based on high scores
        for criterion, score in scores.items():
            if score >= 7.0:
                if criterion == "innovation" and any(word in text_lower for word in ["novel", "unique", "breakthrough", "creative"]):
                    strengths.append(f"Strong {criterion} demonstrated through creative approach")
                elif criterion == "technical_quality" and any(word in text_lower for word in ["algorithm", "system", "implementation", "architecture"]):
                    strengths.append(f"Solid {criterion} with well-thought-out technical approach")
                elif criterion == "impact" and any(word in text_lower for word in ["benefit", "improve", "solve", "address"]):
                    strengths.append(f"Clear {criterion} potential with practical applications")
        
        if not strengths:
            strengths = ["Project demonstrates clear technical understanding", "Well-structured approach to problem-solving"]
        
        return strengths
    
    def _generate_fallback_weaknesses(self, text: str, scores: Dict[str, float]) -> List[str]:
        """Generate fallback weaknesses based on low-scoring criteria"""
        weaknesses = []
        text_lower = text.lower()
        
        # Generate weaknesses based on low scores
        for criterion, score in scores.items():
            if score <= 5.0:
                if criterion == "presentation" and len(text) < 500:
                    weaknesses.append(f"Could improve {criterion} with more detailed explanations")
                elif criterion == "feasibility" and not any(word in text_lower for word in ["implementation", "deploy", "practical"]):
                    weaknesses.append(f"Consider adding more details on {criterion} and practical implementation")
                elif criterion == "technical_quality" and not any(word in text_lower for word in ["algorithm", "system", "method"]):
                    weaknesses.append(f"Enhance {criterion} with more technical implementation details")
        
        if not weaknesses:
            weaknesses = ["Consider adding more technical implementation details", "Could benefit from more specific outcome metrics"]
        
        return weaknesses
    
    def _generate_fallback_summary(self, text: str, scores: Dict[str, float]) -> str:
        """Generate fallback summary based on text content and scores"""
        # Extract key concepts from text
        key_terms = self.extract_keywords(text, top_k=5)
        
        # Create summary based on high-scoring criteria
        high_score_criteria = [c for c, s in scores.items() if s >= 7.0]
        
        if high_score_criteria:
            summary = f"This project demonstrates strong {', '.join(high_score_criteria)}. "
        else:
            summary = "This project presents a technical solution with potential for development. "
        
        summary += f"Key concepts include {', '.join(key_terms[:3])}. "
        
        if any(word in text.lower() for word in ["solve", "address", "improve"]):
            summary += "The project aims to address practical challenges with innovative approaches."
        else:
            summary += "The project shows technical innovation with room for further development."
        
        return summary
    
    def _get_timestamp(self) -> str:
        """Get current timestamp for metadata"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def analyze_text_complexity(self, text: str) -> Dict[str, Any]:
        """Analyze text complexity and structure for better evaluation context"""
        analysis = {
            "word_count": 0,
            "sentence_count": 0,
            "technical_terms": 0,
            "structure_indicators": 0,
            "complexity_score": 0.0
        }
        
        if not text:
            return analysis
        
        # Basic text metrics
        words = text.split()
        analysis["word_count"] = len(words)
        
        # Count sentences (simple approach)
        sentences = re.split(r'[.!?]+', text)
        analysis["sentence_count"] = len([s for s in sentences if s.strip()])
        
        # Technical complexity indicators
        technical_patterns = [
            r'\b[A-Z]{2,}\b',  # Acronyms
            r'\b\d+\.\d+\b',   # Decimal numbers
            r'\b\w+://\w+\b',  # URLs
            r'\b\w+@\w+\.\w+\b',  # Email addresses
            r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b'  # CamelCase
        ]
        
        technical_terms = 0
        for pattern in technical_patterns:
            technical_terms += len(re.findall(pattern, text))
        analysis["technical_terms"] = technical_terms
        
        # Structure indicators
        structure_keywords = [
            "problem", "solution", "method", "result", "conclusion",
            "introduction", "background", "approach", "implementation",
            "evaluation", "analysis", "discussion", "summary"
        ]
        
        structure_count = sum(1 for keyword in structure_keywords if keyword.lower() in text.lower())
        analysis["structure_indicators"] = structure_count
        
        # Calculate complexity score (0-10)
        complexity_score = 0.0
        
        # Word count factor (0-3 points)
        if analysis["word_count"] > 1000:
            complexity_score += 3.0
        elif analysis["word_count"] > 500:
            complexity_score += 2.0
        elif analysis["word_count"] > 200:
            complexity_score += 1.0
        
        # Technical terms factor (0-3 points)
        if analysis["technical_terms"] > 20:
            complexity_score += 3.0
        elif analysis["technical_terms"] > 10:
            complexity_score += 2.0
        elif analysis["technical_terms"] > 5:
            complexity_score += 1.0
        
        # Structure factor (0-2 points)
        if analysis["structure_indicators"] > 6:
            complexity_score += 2.0
        elif analysis["structure_indicators"] > 3:
            complexity_score += 1.0
        
        # Sentence complexity factor (0-2 points)
        if analysis["sentence_count"] > 0:
            avg_words_per_sentence = analysis["word_count"] / analysis["sentence_count"]
            if avg_words_per_sentence > 20:
                complexity_score += 2.0
            elif avg_words_per_sentence > 15:
                complexity_score += 1.0
        
        analysis["complexity_score"] = min(10.0, complexity_score)
        
        return analysis
    
    def extract_technical_context(self, text: str) -> Dict[str, Any]:
        """Extract technical context and domain-specific information"""
        context = {
            "domains": [],
            "technologies": [],
            "methodologies": [],
            "metrics": [],
            "challenges": []
        }
        
        text_lower = text.lower()
        
        # Identify domains
        domain_keywords = {
            "AI/ML": ["artificial intelligence", "machine learning", "deep learning", "neural network", "AI", "ML"],
            "Web Development": ["web", "frontend", "backend", "full-stack", "responsive", "API"],
            "Mobile": ["mobile", "app", "iOS", "Android", "cross-platform"],
            "Data Science": ["data", "analytics", "visualization", "statistics", "database"],
            "Cybersecurity": ["security", "encryption", "authentication", "vulnerability", "threat"],
            "IoT": ["internet of things", "sensor", "connected", "smart device", "IoT"],
            "Blockchain": ["blockchain", "cryptocurrency", "distributed ledger", "smart contract"],
            "Cloud": ["cloud", "AWS", "Azure", "Google Cloud", "deployment"]
        }
        
        for domain, keywords in domain_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                context["domains"].append(domain)
        
        # Identify technologies
        tech_patterns = [
            r'\bPython\b', r'\bJavaScript\b', r'\bJava\b', r'\bC\+\+\b', r'\bReact\b',
            r'\bNode\.js\b', r'\bDjango\b', r'\bFlask\b', r'\bTensorFlow\b', r'\bPyTorch\b',
            r'\bDocker\b', r'\bKubernetes\b', r'\bGit\b', r'\bMongoDB\b', r'\bPostgreSQL\b'
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            context["technologies"].extend(matches)
        
        # Identify methodologies
        methodology_keywords = [
            "agile", "scrum", "waterfall", "lean", "design thinking",
            "user-centered design", "rapid prototyping", "iterative development"
        ]
        
        for keyword in methodology_keywords:
            if keyword in text_lower:
                context["methodologies"].append(keyword.title())
        
        # Extract metrics and measurements
        metric_patterns = [
            r'\b\d+\.?\d*\s*%',  # Percentages
            r'\b\d+\.?\d*\s*(?:accuracy|precision|recall|f1)',  # ML metrics
            r'\b\d+\.?\d*\s*(?:seconds?|minutes?|hours?)',  # Time
            r'\b\d+\.?\d*\s*(?:users?|customers?|transactions?)',  # Counts
        ]
        
        for pattern in metric_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            context["metrics"].extend(matches)
        
        # Identify challenges and problems
        challenge_keywords = [
            "challenge", "problem", "issue", "limitation", "constraint",
            "difficulty", "obstacle", "barrier", "risk", "concern"
        ]
        
        for keyword in challenge_keywords:
            if keyword in text_lower:
                # Extract the sentence containing the challenge
                sentences = re.split(r'[.!?]+', text)
                for sentence in sentences:
                    if keyword.lower() in sentence.lower():
                        context["challenges"].append(sentence.strip())
                        break
        
        # Remove duplicates and limit results
        for key in context:
            if isinstance(context[key], list):
                context[key] = list(set(context[key]))[:5]  # Limit to top 5
        
        return context
    
    def _normalize_scores(self, raw_scores: Dict[str, float], 
                          criteria: List[JudgingCriteria]) -> Dict[str, float]:
        """Normalize scores to 0-10 scale with proper rounding"""
        normalized = {}
        
        for criterion in criteria:
            raw_score = raw_scores.get(criterion.name, 5.0)
            
            # Clamp to valid range
            score = max(criterion.min_score, min(criterion.max_score, float(raw_score)))
            
            # Round to 1 decimal place
            score = round(score, 1)
            
            normalized[criterion.name] = score
        
        return normalized
    
    def _calculate_overall_score(self, scores: Dict[str, float], 
                                criteria: List[JudgingCriteria]) -> float:
        """Calculate weighted overall score"""
        total_weighted_score = 0.0
        total_weight = 0.0
        
        for criterion in criteria:
            if criterion.name in scores:
                total_weighted_score += scores[criterion.name] * criterion.weight
                total_weight += criterion.weight
        
        if total_weight == 0:
            return 0.0
        
        overall = total_weighted_score / total_weight
        return round(overall, 1)
    
    def _enhanced_fallback_scoring(self, text: str, criteria: List[JudgingCriteria], 
                                 sections: Dict[str, str], keywords: List[str]) -> Dict[str, Any]:
        """Enhanced fallback scoring method if AI evaluation fails"""
        # Intelligent rule-based scoring with context awareness
        scores = {}
        text_lower = text.lower()
        text_length = len(text)
        
        for criterion in criteria:
            if criterion.name == "innovation":
                # Check for innovative keywords and concepts
                innovation_words = ["novel", "unique", "breakthrough", "revolutionary", "first", "new approach", "creative", "original"]
                innovation_score = 5.0 + min(3.0, sum(0.5 for word in innovation_words if word in text_lower))
                
                # Bonus for technical innovation indicators
                if any(word in text_lower for word in ["algorithm", "model", "system", "framework"]):
                    innovation_score += 1.0
                
                scores[criterion.name] = min(10.0, innovation_score)
                
            elif criterion.name == "feasibility":
                # Assess practical implementation possibility
                feasibility_score = 5.0
                
                # Check for implementation details
                if any(word in text_lower for word in ["implementation", "deploy", "practical", "real-world"]):
                    feasibility_score += 2.0
                
                # Check for technical specifications
                if any(word in text_lower for word in ["technology", "platform", "infrastructure", "requirements"]):
                    feasibility_score += 1.5
                
                # Check for timeline and resources
                if any(word in text_lower for word in ["timeline", "resources", "budget", "team"]):
                    feasibility_score += 1.0
                
                scores[criterion.name] = min(10.0, feasibility_score)
                
            elif criterion.name == "presentation":
                # Evaluate clarity and communication quality
                presentation_score = 5.0
                
                # Check for structure and organization
                if len(sections.get("problem_statement", "")) > 50:
                    presentation_score += 1.0
                if len(sections.get("methodology", "")) > 50:
                    presentation_score += 1.0
                if len(sections.get("results", "")) > 50:
                    presentation_score += 1.0
                
                # Check for technical clarity
                if len(keywords) >= 5:
                    presentation_score += 1.0
                
                # Penalty for very short text
                if text_length < 200:
                    presentation_score -= 1.0
                
                scores[criterion.name] = max(1.0, min(10.0, presentation_score))
                
            elif criterion.name == "impact":
                # Assess potential social, economic, or scientific impact
                impact_score = 5.0
                
                # Check for clear value proposition
                if any(word in text_lower for word in ["solve", "address", "improve", "benefit", "help"]):
                    impact_score += 2.0
                
                # Check for target audience or market
                if any(word in text_lower for word in ["users", "customers", "market", "community", "society"]):
                    impact_score += 1.5
                
                # Check for scale indicators
                if any(word in text_lower for word in ["global", "large-scale", "widespread", "millions", "billions"]):
                    impact_score += 1.0
                
                scores[criterion.name] = min(10.0, impact_score)
                
            elif criterion.name == "technical_quality":
                # Assess technical sophistication and implementation quality
                technical_score = 5.0
                
                # Check for technical depth
                if any(word in text_lower for word in ["algorithm", "architecture", "system", "framework", "model"]):
                    technical_score += 2.0
                
                # Check for implementation details
                if any(word in text_lower for word in ["code", "implementation", "development", "testing", "validation"]):
                    technical_score += 1.5
                
                # Check for modern technologies
                if any(word in text_lower for word in ["AI", "machine learning", "blockchain", "cloud", "API"]):
                    technical_score += 1.0
                
                scores[criterion.name] = min(10.0, technical_score)
            
            else:
                # Default scoring for unknown criteria
                scores[criterion.name] = 5.0
        
        # Generate intelligent feedback based on scores and content
        strengths = self._generate_fallback_strengths(text, scores)
        weaknesses = self._generate_fallback_weaknesses(text, scores)
        summary = self._generate_fallback_summary(text, scores)
        
        return {
            "criteria_scores": scores,
            "summary": summary,
            "strengths": strengths,
            "weaknesses": weaknesses
        }
    
    def save_result(self, result: JudgingResult, output_file: str):
        """Save judging result to JSON file"""
        output_data = {
            "project_id": result.project_id,
            "criteria_scores": result.criteria_scores,
            "overall_score": result.overall_score,
            "summary": result.summary,
            "feedback": result.feedback,
            "metadata": result.metadata,
            "timestamp": str(np.datetime64('now'))
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"Judging result saved to {output_file}")
    
    def batch_evaluate(self, projects: List[Dict[str, str]], 
                      output_dir: str = "judging_results") -> List[JudgingResult]:
        """Evaluate multiple projects in batch"""
        import os
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        results = []
        
        for i, project in enumerate(projects):
            print(f"Evaluating project {i+1}/{len(projects)}: {project.get('id', f'P{i+1:03d}')}")
            
            try:
                result = self.evaluate_project(
                    project_text=project['text'],
                    project_id=project.get('id', f'P{i+1:03d}'),
                    metadata=project.get('metadata', {})
                )
                
                results.append(result)
                
                # Save individual result
                output_file = os.path.join(output_dir, f"{result.project_id}_judging.json")
                self.save_result(result, output_file)
                
            except Exception as e:
                print(f"Error evaluating project {project.get('id', f'P{i+1:03d}')}: {e}")
                continue
        
        return results
