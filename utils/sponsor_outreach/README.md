# Sponsor Outreach AI Module

AI-powered sponsor outreach with intelligent scoring, web scraping, and pitch generation. Features real sponsors (Lovable, ElevenLabs, AkashX) with customized pitch decks and diverse scoring. Uses OpenAI as primary with intelligent fallback scoring, plus web scraping for sponsor discovery and professional HTML pitch deck generation.

## Features

- **🔍 Web Scraping**: Automatically discovers potential sponsors using Google search and web scraping
- **🤖 Smart Sponsor Scoring**: AI analyzes company fit (0-100) with customized scoring for real companies
- **📝 Dynamic Pitch Generation**: Creates personalized sponsorship pitches with unique designs for each sponsor
- **🌐 Website Validation**: Checks sponsor website status and extracts company information
- **📊 Comprehensive CRM**: Manages sponsor data, contact information, and outreach progress
- **📋 Outreach Reports**: Generates detailed reports with actionable insights
- **🎨 Professional HTML Templates**: Creates beautiful, customized pitch decks with sponsor-specific content
- **🔄 Intelligent Fallback System**: OpenAI → Custom scoring, with unique scores for Lovable, ElevenLabs, AkashX

## Installation

```bash
cd utils/sponsor_outreach
pip3 install -r requirements.txt
```

## Setup

### Environment Variables
Create a `.env` file in the module directory:

```bash
# OpenAI API (for AI-powered scoring)
OPENAI_API_KEY="your-openai-api-key-here"

# Canva API (for pitch deck generation)
CANVA_API_KEY="your-canva-api-key-here"
```

### Option 1: Full AI (Recommended)
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### Option 2: Demo Mode (Enhanced)
No setup required - uses intelligent fallback scoring with customized scores for real sponsors and professional HTML pitch generation.

## Usage

### Command Line

```bash
# Discover new sponsors via web scraping and generate pitch decks
python3 sponsor_mvp.py
# # Discover new sponsors via web scraping and generate pitch decks
# python3 sponsor_cli.py --discover --generate-pitches

# # Use curated list with real sponsors (Lovable, ElevenLabs, AkashX)
# python3 sponsor_cli.py --curated --generate-pitches

# # Full process with custom search terms
# python3 sponsor_cli.py --discover --search-terms "AI startups" "fintech companies" --max-results 30

# # Re-analyze existing sponsors
# python3 sponsor_cli.py --analyze-existing

# # Validate websites only
# python3 sponsor_cli.py --validate-only

# # Run enhanced demo with real sponsors
# python3 demo_enhanced.py
```

### Python API

```python
from sponsor_mvp import SponsorService

# With OpenAI
service = SponsorService(
    openai_api_key="your-openai-key"
)
service.run_full_process(discover_new=True)

# Demo mode (enhanced fallback scoring with real sponsors)
service = SponsorService(openai_api_key="demo")
service.run_full_process(discover_new=True)
```

## Real Sponsor Integration

- **🏢 Curated Sponsor List**: Includes real companies like Lovable, ElevenLabs, and AkashX
- **🎯 Customized Scoring**: Each sponsor gets unique fit scores and reasoning
- **🎨 Branded Pitch Decks**: Sponsor-specific designs, colors, and messaging
- **💼 Industry Alignment**: Tailored benefits and integration opportunities for each sponsor

## Web Scraping Features

- **🔍 Google Search Integration**: Automatically searches for potential sponsors
- **🌐 Company Data Extraction**: Scrapes company names, descriptions, industries, technologies
- **📧 Contact Discovery**: Finds email addresses and phone numbers
- **🔗 Social Media Links**: Extracts LinkedIn, Twitter, GitHub profiles
- **⚡ Smart Filtering**: Excludes social media and non-company sites
- **⏱️ Rate Limiting**: Respectful scraping with delays between requests

## Professional HTML Pitch Decks

- **🎨 Customized Templates**: Each sponsor gets unique design with brand colors
- **📊 Dynamic Content**: Automatically populates with sponsor-specific information
- **📱 Responsive Design**: Modern, mobile-friendly HTML presentations
- **🎯 Sponsor-Specific Messaging**: Tailored value propositions and benefits
- **💻 Easy Sharing**: HTML format for easy emailing and web hosting

## Output

- **📄 Pitch Decks**: Generated in `pitches/` directory (Canva PDFs or HTML)
- **📊 CSV Results**: Saved to `sponsors.csv` with comprehensive data
- **📋 Outreach Reports**: Markdown reports with actionable insights
- **🌐 Scraped Data**: JSON files with extracted company information
- **📱 Console Logs**: Real-time progress and scoring

## AI Providers

**Priority Order:**
1. **OpenAI** - Best quality, requires API key
2. **Demo** - Hard-coded scoring, always works

**Models:**
- OpenAI: `gpt-4o-mini` (default), `gpt-4`, `gpt-3.5-turbo`

## Requirements

- Python 3.8+
- Chrome/Chromium browser (for web scraping)
- `requests>=2.31.0`
- `pandas>=2.0.0`
- `openai>=1.0.0`
- `beautifulsoup4>=4.12.0`
- `selenium>=4.15.0`
- `webdriver-manager>=4.0.0`

## Event Configuration

Edit the `event_data` in `sponsor_mvp.py` to customize:
- Event name and details
- Participant count and demographics
- Focus areas and location
- Sponsorship tiers and pricing

## Demo

Run the enhanced demo to see real sponsors and customized pitch decks:

```bash
# Enhanced demo with real sponsors (Lovable, ElevenLabs, AkashX)
python3 demo_enhanced.py

# Original demo
python3 demo.py
```

## Troubleshooting

### Web Scraping Issues
- Ensure Chrome/Chromium is installed
- Check internet connection
- Verify websites aren't blocking automated access

### HTML Generation Issues
- Check file permissions in pitch_decks directory
- Verify HTML template syntax
- Ensure proper encoding for special characters

### OpenAI Issues
- Verify API key is valid
- Check account credits
- Ensure model availability

## Architecture

```
SponsorService
├── WebScraper (Selenium + BeautifulSoup)
├── HTMLPitchDeck (Customized templates)
├── AI Analysis (OpenAI + intelligent fallback)
├── Real Sponsor Integration (Lovable, ElevenLabs, AkashX)
└── CRM Management (CSV + reports)
```

## Contributing

This module follows the HackSphere project structure and coding standards. All new features should maintain backward compatibility and include proper error handling.