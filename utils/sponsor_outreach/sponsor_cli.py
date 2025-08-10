#!/usr/bin/env python3
"""
Sponsor CLI - Simple command line interface
Uses Ollama for local AI processing
"""

import argparse
import os
from sponsor_mvp import SponsorService

def main():
    parser = argparse.ArgumentParser(description="Sponsor Outreach AI Module")
    parser.add_argument("--hunt", action="store_true", help="Find and analyze sponsors")
    parser.add_argument("--analyze", action="store_true", help="Re-analyze existing sponsors")
    parser.add_argument("--openai-key", help="OpenAI API key (optional)")
    
    args = parser.parse_args()
    
    # Get OpenAI key from args or environment
    openai_key = args.openai_key or os.getenv("OPENAI_API_KEY")
    
    service = SponsorService(openai_api_key=openai_key)
    
    if args.hunt:
        service.run_full_process()
    elif args.analyze:
        service.analyze_existing()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()