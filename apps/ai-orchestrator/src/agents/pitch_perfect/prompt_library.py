from langchain_core.prompts import PromptTemplate


OUTLINE_PROMPT = PromptTemplate.from_template(
    """
You are PitchPerfect, a startup pitch coach. Create a concise, investor-ready outline for the team based on their idea.

Team Idea Description:
{idea}

Output strictly as JSON with keys:
{{
  "Problem": "...",
  "Solution": "...",
  "Market": "...",
  "CompetitiveLandscape": "...",
  "BusinessModel": "...",
  "Team": "...",
  "Traction": "...",
  "CallToAction": "..."
}}
Each value should be 3-6 bullet points, short but specific.
    """
)


COACH_SECTION_PROMPT = PromptTemplate.from_template(
    """
You are PitchPerfect, a critical but constructive pitch coach. Analyze the given section and provide improvements.

Section: {section_name}
Current Content:
{section_text}

Company Context:
{idea}

Return strictly JSON with keys:
{{
  "issues": ["...", "..."],
  "suggestions": ["...", "..."],
  "rewrite": "a concise improved version of this section"
}}
    """
)


# New: Input parser to structure a raw draft pitch into standard sections
INPUT_PARSER_PROMPT = PromptTemplate.from_template(
    """
You are PitchPerfect, a startup pitch coach. Parse the following raw draft pitch into the standard sections.

Raw Pitch:
{pitch_text}

Output strict JSON with keys (strings):
{{
  "Problem": "...",
  "Solution": "...",
  "Market": "...",
  "CompetitiveLandscape": "...",
  "BusinessModel": "...",
  "Team": "...",
  "Traction": "...",
  "CallToAction": "..."
}}
If any section is missing in the draft, infer a concise placeholder from context.
    """
)


# New: Section analyzer returns numeric scores and bullet feedback only
SECTION_ANALYZER_PROMPT = PromptTemplate.from_template(
    """
Evaluate the pitch section for a venture-backed startup.

Section: {section_name}
Content:
{section_text}

Return strict JSON with:
{{
  "scores": {{
    "clarity": 0-10,
    "valueProposition": 0-10,
    "persuasiveness": 0-10
  }},
  "feedback": ["bullet feedback points"]
}}
    """
)


# New: Improvement prompt focuses on rewrite only
IMPROVEMENT_PROMPT = PromptTemplate.from_template(
    """
Rewrite the section to be more compelling for a venture capital audience while staying faithful to the facts.

Section: {section_name}
Current Content:
{section_text}

Return strict JSON: {{ "rewrite": "improved concise section" }}
    """
)


STORYTELLING_PROMPT = PromptTemplate.from_template(
    """
You are a storytelling expert. Review the pitch outline and suggest emotional engagement improvements.

Outline JSON:
{outline_json}

Return strictly JSON with keys:
{{
  "hooks": ["one-line hooks"],
  "analogies": ["useful analogies"],
  "customerStories": ["short customer anecdotes"],
  "narrativeArc": "beginning-middle-end narrative guidance"
}}
    """
)


PROTOTYPE_REVIEW_PROMPT = PromptTemplate.from_template(
    """
You are a product design reviewer. Given a prototype description (and optional images), identify UX improvements.

Prototype Description:
{prototype_text}

Return strictly JSON with keys:
{{
  "usability": ["issues and fixes"],
  "featureAlignment": ["align features to problem/solution"],
  "userJourney": ["improvements to flows/onboarding"],
  "risks": ["notable risks to validate"]
}}
    """
)


SCORING_PROMPT = PromptTemplate.from_template(
    """
Score the pitch on clarity, persuasiveness, originality, and feasibility.

Outline JSON:
{outline_json}

Return strictly JSON with keys and values in the specified ranges:
{{
  "clarity": 0-10,
  "persuasiveness": 0-10,
  "originality": 0-10,
  "feasibility": 0-10,
  "rationale": ["short reasons"],
  "overall": 0-100
}}
Overall should roughly equal 2.5*(clarity + persuasiveness + originality + feasibility).
    """
)


