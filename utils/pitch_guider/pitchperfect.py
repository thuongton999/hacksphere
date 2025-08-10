import json
import os
import time
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple

from langchain_core.output_parsers import StrOutputParser

from .langchain_setup import get_llm
from .prompt_library import (
    OUTLINE_PROMPT,
    COACH_SECTION_PROMPT,
    INPUT_PARSER_PROMPT,
    SECTION_ANALYZER_PROMPT,
    IMPROVEMENT_PROMPT,
    STORYTELLING_PROMPT,
    PROTOTYPE_REVIEW_PROMPT,
    SCORING_PROMPT,
)
 


def _safe_json_parse(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        # Attempt to extract JSON body if extra text appears
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                pass
        raise


def _invoke_json(prompt_chain, **kwargs) -> Dict[str, Any]:
    raw = prompt_chain.invoke(kwargs)
    if isinstance(raw, str):
        text = raw
    else:
        text = raw
    return _safe_json_parse(text)


def parse_draft_to_sections(pitch_text: str, model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0.2)
    chain = INPUT_PARSER_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, pitch_text=pitch_text)


def generate_outline(idea: str, model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0.3)
    chain = OUTLINE_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, idea=idea)


def coach_section(section_name: str, section_text: str, idea: str, model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0.2)
    chain = COACH_SECTION_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, section_name=section_name, section_text=section_text, idea=idea)


def analyze_section(section_name: str, section_text: str, model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0)
    chain = SECTION_ANALYZER_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, section_name=section_name, section_text=section_text)


def improve_section(section_name: str, section_text: str, model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0.4)
    chain = IMPROVEMENT_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, section_name=section_name, section_text=section_text)


def storytelling_enhancements(outline_json: Dict[str, Any], model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0.7)
    chain = STORYTELLING_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, outline_json=json.dumps(outline_json, ensure_ascii=False))


def prototype_review(prototype_text: str, model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0.3)
    chain = PROTOTYPE_REVIEW_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, prototype_text=prototype_text)


def score_pitch(outline_json: Dict[str, Any], model: Optional[str] = None) -> Dict[str, Any]:
    llm = get_llm(model=model, temperature=0)
    chain = SCORING_PROMPT | llm | StrOutputParser()
    return _invoke_json(chain, outline_json=json.dumps(outline_json, ensure_ascii=False))


@dataclass
class PitchIteration:
    version: int
    timestamp: float
    outline: Dict[str, Any]
    coached_sections: Dict[str, Any]
    analyzed_sections: Dict[str, Any]
    improved_sections: Dict[str, Any]
    storytelling: Dict[str, Any]
    prototype_feedback: Optional[Dict[str, Any]]
    scores: Dict[str, Any]


def iterate_pitch(
    idea: str,
    draft_pitch_text: Optional[str] = None,
    prototype_text: Optional[str] = None,
    model: Optional[str] = None,
) -> PitchIteration:
    # Input Chain: parse a raw draft pitch into sections or generate from idea
    if draft_pitch_text:
        outline = parse_draft_to_sections(draft_pitch_text, model=model)
    else:
        outline = generate_outline(idea, model=model)

    # Evaluation Chain
    analyzed_sections: Dict[str, Any] = {}
    for section_name, section_text in outline.items():
        analyzed_sections[section_name] = analyze_section(section_name, section_text, model=model)

    # Rewrite Chain
    improved_sections: Dict[str, Any] = {}
    for section_name, section_text in outline.items():
        improved_sections[section_name] = improve_section(section_name, section_text, model=model)

    # Coaching (rationale + rewrite combined)
    coached_sections: Dict[str, Any] = {}
    for section_name, section_text in outline.items():
        coached_sections[section_name] = coach_section(section_name, section_text, idea, model=model)

    # Storytelling Chain
    storytelling = storytelling_enhancements(outline, model=model)

    # Prototype review
    proto = prototype_review(prototype_text, model=model) if prototype_text else None

    # Scoring Chain
    scores = score_pitch(outline, model=model)

    return PitchIteration(
        version=1,
        timestamp=time.time(),
        outline=outline,
        coached_sections=coached_sections,
        analyzed_sections=analyzed_sections,
        improved_sections=improved_sections,
        storytelling=storytelling,
        prototype_feedback=proto,
        scores=scores,
    )


def save_iteration(iteration: PitchIteration, out_dir: str) -> str:
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"pitch_iteration_v{iteration.version}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(asdict(iteration), f, ensure_ascii=False, indent=2)
    return path


