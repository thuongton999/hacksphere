# Sponsor Outreach AI Module

AI-powered sponsor outreach with intelligent scoring and pitch generation. Uses OpenAI as primary with hard-coded demo fallback.

## Features

- **Smart Sponsor Scoring**: AI analyzes company fit (0-100) based on event context
- **Dynamic Pitch Generation**: Creates personalized sponsorship pitches
- **Website Validation**: Checks sponsor website status
- **HTML Output**: Generates professional pitch decks
- **Fallback System**: OpenAI → Demo scoring
- **CSV Export**: Saves results for follow-up

## Installation

```bash
cd utils/sponsor_outreach
pip install -r requirements.txt
```

## Setup

### Option 1: OpenAI (Recommended)
```bash
export OPENAI_API_KEY="your-api-key-here"
# or pass via CLI: --openai-key "your-key"
```

### Option 2: Demo Mode
No setup required - uses hard-coded scoring and pitches.

## Usage

### Command Line

```bash
# Find and analyze sponsors (uses OpenAI if available, demo if not)
python3 sponsor_cli.py --hunt

# Re-analyze existing sponsors
python3 sponsor_cli.py --analyze

# With OpenAI API key
python3 sponsor_cli.py --hunt --openai-key "your-key"
```

### Python API

```python
from sponsor_mvp import SponsorService

# With OpenAI
service = SponsorService(openai_api_key="your-key")
service.run_full_process()

# Demo mode (no AI)
service = SponsorService()
service.run_full_process()  # Falls back to demo
```

## Output

- **HTML Pitches**: Generated in `pitches/` directory
- **CSV Results**: Saved to `sponsors.csv`
- **Console Logs**: Real-time progress and scoring

## AI Providers

**Priority Order:**
1. **OpenAI** - Best quality, requires API key
2. **Demo** - Hard-coded scoring, always works

**Models:**
- OpenAI: `gpt-4o-mini` (default), `gpt-4`, `gpt-3.5-turbo`

## Requirements

- Python 3.8+
- `requests>=2.31.0`
- `pandas>=2.0.0`
- `openai>=1.0.0`

## Event Configuration

Edit the `event_data` in `sponsor_mvp.py` to customize:
- Event name and details
- Participant count and demographics
- Focus areas and location