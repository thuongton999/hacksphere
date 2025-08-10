## PitchPerfect – AI Pitch Creation & Coaching

AI agent that generates a pitch outline, coaches each section, enhances storytelling, optionally reviews prototypes, and scores quality to guide iterative improvements.

### Core capabilities
- Guided Pitch Template Generator (Problem, Solution, Market, Competitive Landscape, Business Model, Team, Traction, Call-to-Action)
- Input Chain (parse raw draft into sections)
- Evaluation Chain (numeric scoring + feedback per section)
- Rewrite Chain (focused improved versions)
- Iterative AI Coaching (section-by-section analysis + rewrites)
- Storytelling Enhancer (hooks, analogies, customer stories, narrative arc)
- Prototype Review (text, optional multimodal later)
- Scoring & Iteration (clarity, persuasiveness, originality, feasibility, overall)
 

### Requirements
- Python 3.9+
- Packages:
  - `langchain`
  - `langchain-openai`
  - `openai`

Install (Windows PowerShell):
```powershell
python -m pip install --user langchain langchain-openai openai
```

### API keys
- Prefer OpenRouter:
  - `OPENROUTER_API_KEY` (required)
  - Optional: `OPENAI_API_BASE=https://openrouter.ai/api/v1` (auto-set if using OpenRouter key)
  - Optional: `PITCHPERFECT_MODEL` (default: `qwen/qwen3-30b-a3b-instruct-2507`)
- Or use OpenAI:
  - `OPENAI_API_KEY` (required)

Set for current session:
```powershell
$env:OPENROUTER_API_KEY = "sk-or-..."
```

### Files
- `langchain_setup.py`: LLM factory using OpenRouter or OpenAI
- `prompt_library.py`: Prompt templates for input parsing, section analysis, improvement rewrites, outline, coaching, storytelling, prototype review, scoring
- `pitchperfect.py`: Orchestrates the full iteration (Input → Evaluation → Rewrite → Coaching → Storytelling → Scoring) and saves versioned JSON
- `pitchperfect_cli.py`: CLI to run the agent
 
- `test.py`: minimal OpenRouter chat example (sanitized; uses env vars)

### Run – CLI
```powershell
python -m utils.pitch_guider.pitchperfect_cli --idea "Uber for bikes in college towns" --prototype "Figma mobile app with QR unlock and subscription checkout"

# Or: start from a raw draft pitch
python -m utils.pitch_guider.pitchperfect_cli --idea "Bike share" --draft "We help students get bikes fast. Our app..."

 
```
Output: `utils/pitch_guider/sessions/pitch_iteration_v1.json`

### JSON output structure (abridged)
```json
{
  "version": 1,
  "timestamp": 1730000000.0,
  "outline": {"Problem": "...", "Solution": "...", "Market": "...", ...},
  "coached_sections": {"Problem": {"issues": [], "suggestions": [], "rewrite": "..."}, ...},
  "storytelling": {"hooks": [], "analogies": [], "customerStories": [], "narrativeArc": "..."},
  "prototype_feedback": {"usability": [], "featureAlignment": [], "userJourney": [], "risks": []},
  "scores": {"clarity": 8, "persuasiveness": 7, "originality": 6, "feasibility": 8, "rationale": [], "overall": 72}
}
```

### Backend integration
- Expose a POST endpoint (e.g., FastAPI) that:
  1) Accepts JSON `{ idea: str, prototype: str | null }`
  2) Optionally include `{ draft: str | null }` to use the Input Chain
  3) Calls `iterate_pitch`
  3) Persists output JSON to DB or object storage
  4) Returns the JSON to the frontend

Minimal example (FastAPI):
```python
from fastapi import FastAPI
from utils.pitch_guider.pitchperfect import iterate_pitch

app = FastAPI()

@app.post("/pitch/iterate")
def pitch_iterate(payload: dict):
    idea = payload.get("idea", "")
    prototype = payload.get("prototype")
    draft = payload.get("draft")
    it = iterate_pitch(idea=idea, draft_pitch_text=draft, prototype_text=prototype)
    return it.__dict__
```

### Notes
- All prompts request strict JSON; parsing includes a safety fallback.
- You can swap models via `--model` or `PITCHPERFECT_MODEL`.
- Add a version store (DB) to track iteration history across edits.
 


