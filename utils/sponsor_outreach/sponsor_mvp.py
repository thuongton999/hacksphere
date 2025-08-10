#!/usr/bin/env python3

import os
import re
import time
import csv
import requests
import pandas as pd
from datetime import datetime
from typing import List, Dict

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

class SponsorService:
    def __init__(self, openai_api_key=None, openai_model="gpt-4o-mini"):
        self.openai_api_key = openai_api_key
        self.openai_model = openai_model
        self.sponsors_file = "sponsors.csv"
        self.pitches_dir = "pitches"
        os.makedirs(self.pitches_dir, exist_ok=True)
        
        # Set up AI provider
        if OPENAI_AVAILABLE and self.openai_api_key:
            openai.api_key = self.openai_api_key
            self.ai_provider = "openai"
        else:
            self.ai_provider = "demo"
        
        self.event_data = {
            "name": "HackSphere 2025",
            "participants": 500,
            "demographics": "60% students, 25% professionals, 15% entrepreneurs",
            "focus": "AI, Web Dev, Mobile Apps",
            "date": "March 2025",
            "location": "San Francisco"
        }
        
    
    def get_sponsors(self) -> List[Dict]:
        return [
            {"name": "GitHub", "domain": "github.com", "industry": "Developer Tools", "size": "1000+", "email": "partnerships@github.com", "website": "https://github.com"},
            {"name": "Vercel", "domain": "vercel.com", "industry": "Cloud/DevOps", "size": "100-500", "email": "partnerships@vercel.com", "website": "https://vercel.com"},
            {"name": "MongoDB", "domain": "mongodb.com", "industry": "Database", "size": "1000+", "email": "partnerships@mongodb.com", "website": "https://mongodb.com"},
            {"name": "Stripe", "domain": "stripe.com", "industry": "Fintech", "size": "1000+", "email": "partnerships@stripe.com", "website": "https://stripe.com"},
            {"name": "OpenAI", "domain": "openai.com", "industry": "AI/ML", "size": "500-1000", "email": "partnerships@openai.com", "website": "https://openai.com"},
            {"name": "Figma", "domain": "figma.com", "industry": "Design Tools", "size": "500-1000", "email": "partnerships@figma.com", "website": "https://figma.com"},
            {"name": "Supabase", "domain": "supabase.com", "industry": "Backend/Database", "size": "50-200", "email": "partnerships@supabase.com", "website": "https://supabase.com"},
            {"name": "Notion", "domain": "notion.so", "industry": "Productivity", "size": "200-500", "email": "partnerships@notion.so", "website": "https://notion.so"},
            {"name": "Discord", "domain": "discord.com", "industry": "Communication", "size": "500-1000", "email": "partnerships@discord.com", "website": "https://discord.com"},
            {"name": "Replit", "domain": "replit.com", "industry": "Developer Tools", "size": "50-200", "email": "partnerships@replit.com", "website": "https://replit.com"},
            {"name": "Auth0", "domain": "auth0.com", "industry": "Security", "size": "500-1000", "email": "partnerships@auth0.com", "website": "https://auth0.com"},
            {"name": "Twilio", "domain": "twilio.com", "industry": "Communications API", "size": "1000+", "email": "partnerships@twilio.com", "website": "https://twilio.com"},
            {"name": "Cloudflare", "domain": "cloudflare.com", "industry": "Cloud/Security", "size": "1000+", "email": "partnerships@cloudflare.com", "website": "https://cloudflare.com"},
            {"name": "Datadog", "domain": "datadoghq.com", "industry": "Monitoring", "size": "1000+", "email": "partnerships@datadoghq.com", "website": "https://datadoghq.com"},
            {"name": "PlanetScale", "domain": "planetscale.com", "industry": "Database", "size": "50-200", "email": "partnerships@planetscale.com", "website": "https://planetscale.com"},
            {"name": "Netlify", "domain": "netlify.com", "industry": "Cloud/DevOps", "size": "100-500", "email": "partnerships@netlify.com", "website": "https://netlify.com"},
            {"name": "Heroku", "domain": "heroku.com", "industry": "Cloud/DevOps", "size": "1000+", "email": "partnerships@heroku.com", "website": "https://heroku.com"},
            {"name": "SendGrid", "domain": "sendgrid.com", "industry": "Communications API", "size": "500-1000", "email": "partnerships@sendgrid.com", "website": "https://sendgrid.com"},
            {"name": "Algolia", "domain": "algolia.com", "industry": "Search/API", "size": "200-500", "email": "partnerships@algolia.com", "website": "https://algolia.com"},
            {"name": "Contentful", "domain": "contentful.com", "industry": "CMS/API", "size": "200-500", "email": "partnerships@contentful.com", "website": "https://contentful.com"}
        ]
    
    def validate_websites(self, sponsors: List[Dict]) -> List[Dict]:
        print("🔍 Validating sponsor websites...")
        validated_sponsors = []
        
        for sponsor in sponsors:
            try:
                response = requests.head(sponsor['website'], timeout=5, allow_redirects=True)
                if response.status_code < 400:
                    sponsor['website_status'] = 'active'
                    sponsor['last_checked'] = datetime.now().strftime('%Y-%m-%d %H:%M')
                    print(f"  ✅ {sponsor['name']} - Active")
                else:
                    sponsor['website_status'] = 'error'
                    sponsor['last_checked'] = datetime.now().strftime('%Y-%m-%d %H:%M')
                    print(f"  ⚠️  {sponsor['name']} - HTTP {response.status_code}")
                
                validated_sponsors.append(sponsor)
                time.sleep(0.5)
                
            except Exception as e:
                sponsor['website_status'] = 'unreachable'
                sponsor['last_checked'] = datetime.now().strftime('%Y-%m-%d %H:%M')
                print(f"  ❌ {sponsor['name']} - Unreachable")
                validated_sponsors.append(sponsor)
        
        return validated_sponsors
    
    def analyze_fit(self, sponsor: Dict) -> int:
        # Try OpenAI first
        if self.ai_provider == "openai" and self.openai_api_key:
            try:
                prompt = f"""
                Rate how well this company fits as a hackathon sponsor (0-100):
                
                Company: {sponsor['name']}
                Industry: {sponsor['industry']}
                Size: {sponsor['size']}
                
                Event: {self.event_data['name']} - {self.event_data['participants']} participants
                Focus: {self.event_data['focus']}
                Demographics: {self.event_data['demographics']}
                
                Consider: developer audience fit, talent recruiting value, brand alignment.
                Return just the number (0-100).
                """
                
                response = openai.chat.completions.create(
                    model=self.openai_model,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                content = response.choices[0].message.content.strip()
                numbers = re.findall(r'\d+', content)
                if numbers:
                    score = int(numbers[0])
                    return max(0, min(100, score))
                else:
                    print(f"  ⚠️  Couldn't parse score from OpenAI response: {content}")
                    # Fall through to demo scoring
                    
            except Exception as e:
                print(f"  ⚠️  OpenAI scoring failed for {sponsor['name']}: {e}")
                # Fall through to demo scoring
        
        # Final fallback: demo scoring
        return self.fallback_scoring(sponsor)
    
    def fallback_scoring(self, sponsor: Dict) -> int:
        industry_scores = {
            "Developer Tools": 90,
            "AI/ML": 85,
            "Cloud/DevOps": 80,
            "Database": 75,
            "Design Tools": 70,
            "Fintech": 65,
            "Security": 75,
            "Communications API": 70,
            "Search/API": 75,
            "CMS/API": 70
        }
        return industry_scores.get(sponsor['industry'], 60)
    
    def generate_pitch(self, sponsor: Dict, fit_score: int) -> str:
        # Try OpenAI first
        if self.ai_provider == "openai" and self.openai_api_key:
            try:
                prompt = f"""
                Create a sponsorship pitch for:
                
                Company: {sponsor['name']} (Fit Score: {fit_score}/100)
                Industry: {sponsor['industry']}
                
                Event: {self.event_data['name']}
                - {self.event_data['participants']} participants
                - {self.event_data['demographics']}
                - Focus: {self.event_data['focus']}
                - When: {self.event_data['date']}
                - Where: {self.event_data['location']}
                
                Generate 3-4 key bullet points why {sponsor['name']} should sponsor us.
                Focus on developer talent, innovation, brand exposure.
                Format as a simple list with bullet points.
                """
                
                response = openai.chat.completions.create(
                    model=self.openai_model,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                pitch_points = response.choices[0].message.content.strip()
                return self.create_html_pitch(sponsor, fit_score, pitch_points)
                
            except Exception as e:
                print(f"  ⚠️  OpenAI pitch generation failed for {sponsor['name']}: {e}")
                # Fall through to demo pitch
        
        # Final fallback: demo pitch
        return self.fallback_pitch(sponsor, fit_score)
    
    def fallback_pitch(self, sponsor: Dict, fit_score: int) -> str:
        pitch_points = f"""
        • Access to {self.event_data['participants']} top developers and designers
        • Early exposure to innovative projects in {self.event_data['focus']}
        • Talent recruitment from {self.event_data['demographics']}
        • Brand visibility in the developer community
        """
        return self.create_html_pitch(sponsor, fit_score, pitch_points)
    
    def create_html_pitch(self, sponsor: Dict, fit_score: int, pitch_points: str) -> str:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Partnership Proposal - {sponsor['name']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px; }}
                .section {{ background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                .highlight {{ background: #e7f3ff; padding: 15px; border-left: 4px solid #2563eb; }}
                .tier {{ background: white; padding: 20px; margin: 10px 0; border: 2px solid #e9ecef; border-radius: 8px; }}
                ul {{ line-height: 1.8; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Partnership Opportunity</h1>
                <h2>{self.event_data['name']} × {sponsor['name']}</h2>
                <p>Generated on {datetime.now().strftime('%B %d, %Y')}</p>
            </div>
            
            <div class="section">
                <h2>Why Partner With Us?</h2>
                <div class="highlight">
                    <strong>AI Fit Score: {fit_score}/100</strong> - Excellent alignment with your goals
                </div>
                <div style="white-space: pre-line; margin-top: 15px;">{pitch_points}</div>
            </div>
            
            <div class="section">
                <h2>Event Overview</h2>
                <ul>
                    <li><strong>Participants:</strong> {self.event_data['participants']} developers, designers, entrepreneurs</li>
                    <li><strong>Demographics:</strong> {self.event_data['demographics']}</li>
                    <li><strong>Focus Areas:</strong> {self.event_data['focus']}</li>
                    <li><strong>When:</strong> {self.event_data['date']}</li>
                    <li><strong>Where:</strong> {self.event_data['location']}</li>
                </ul>
            </div>
            
            <div class="section">
                <h2>Sponsorship Tiers</h2>
                
                <div class="tier">
                    <h3>🥇 Platinum - $50,000</h3>
                    <ul>
                        <li>Title sponsorship and main stage branding</li>
                        <li>Dedicated recruiting booth</li>
                        <li>Judge panel seat</li>
                        <li>Access to all participant resumes</li>
                    </ul>
                </div>
                
                <div class="tier">
                    <h3>🥈 Gold - $25,000</h3>
                    <ul>
                        <li>Category sponsorship</li>
                        <li>Workshop/tech talk slot</li>
                        <li>Booth space</li>
                        <li>Logo on all materials</li>
                    </ul>
                </div>
                
                <div class="tier">
                    <h3>🥉 Silver - $10,000</h3>
                    <ul>
                        <li>Booth space</li>
                        <li>Swag distribution</li>
                        <li>Website listing</li>
                        <li>Social media mentions</li>
                    </ul>
                </div>
            </div>
            
            <div class="section">
                <h2>Next Steps</h2>
                <p><strong>Ready to partner?</strong> Let's schedule a 15-minute call to discuss how {sponsor['name']} can get involved.</p>
                <p>📧 <strong>partnerships@hacksphere.ai</strong></p>
                <p>📅 <strong>calendly.com/hacksphere-partnerships</strong></p>
                <p>📱 <strong>(555) 123-HACK</strong></p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 40px;">
                Generated by SponsorReach AI (Local) • Confidential Partnership Proposal
            </div>
        </body>
        </html>
        """
        
        return html_content
    
    def run_full_process(self):
        print("🔍 Getting curated sponsor list...")
        
        sponsors = self.get_sponsors()
        print(f"📋 Found {len(sponsors)} potential sponsors")
        
        sponsors = self.validate_websites(sponsors)
        
        print("🤖 Analyzing sponsor fit...")
        if self.ai_provider == "openai" and self.openai_api_key:
            print(f"  Using OpenAI model: {self.openai_model}")
        else:
            print("  Using demo mode (hard-coded scoring)")
        
        results = []
        
        for sponsor in sponsors:
            print(f"  Analyzing {sponsor['name']}...")
            fit_score = self.analyze_fit(sponsor)
            
            sponsor['fit_score'] = fit_score
            sponsor['last_updated'] = datetime.now().strftime('%Y-%m-%d')
            results.append(sponsor)
            
            if fit_score >= 70:
                print(f"  📝 Generating pitch for {sponsor['name']} (score: {fit_score})")
                pitch_html = self.generate_pitch(sponsor, fit_score)
                
                filename = f"{sponsor['name'].lower().replace(' ', '_')}_pitch.html"
                with open(f"{self.pitches_dir}/{filename}", "w") as f:
                    f.write(pitch_html)
        
        self.save_to_csv(results)
        
        print("\n🎯 TOP SPONSOR PROSPECTS:")
        high_fit = [s for s in results if s['fit_score'] >= 70]
        high_fit.sort(key=lambda x: x['fit_score'], reverse=True)
        
        for sponsor in high_fit[:10]:
            status_icon = "✅" if sponsor.get('website_status') == 'active' else "⚠️"
            print(f"  {status_icon} {sponsor['name']}: {sponsor['fit_score']}/100 - {sponsor['email']}")
        
        print(f"\n✅ Generated {len(high_fit)} pitch decks in '{self.pitches_dir}/' folder")
        print(f"💾 Saved {len(results)} contacts to '{self.sponsors_file}'")
        
        if self.ai_provider == "openai" and self.openai_api_key:
            print(f"🤖 AI scoring powered by OpenAI ({self.openai_model})")
        else:
            print("📋 Using demo mode (hard-coded scoring)")
    
    def analyze_existing(self):
        try:
            df = pd.read_csv(self.sponsors_file)
            sponsors = df.to_dict('records')
        except:
            print("No existing sponsors file found. Run with --hunt first.")
            return
        
        print("🤖 Re-analyzing existing sponsors...")
        if self.ai_provider == "openai" and self.openai_api_key:
            print(f"  Using OpenAI model: {self.openai_model}")
        else:
            print("  Using fallback scoring (no AI available)")
        
        for sponsor in sponsors:
            fit_score = self.analyze_fit(sponsor)
            sponsor['fit_score'] = fit_score
            sponsor['last_updated'] = datetime.now().strftime('%Y-%m-%d')
        
        self.save_to_csv(sponsors)
        
        high_fit = [s for s in sponsors if s['fit_score'] >= 70]
        high_fit.sort(key=lambda x: x['fit_score'], reverse=True)
        
        print(f"\n🎯 TOP {len(high_fit)} PROSPECTS:")
        for sponsor in high_fit:
            print(f"  • {sponsor['name']}: {sponsor['fit_score']}/100")
    
    def save_to_csv(self, sponsors: List[Dict]):
        fieldnames = ['name', 'domain', 'industry', 'size', 'email', 'website', 'website_status', 'last_checked', 'fit_score', 'last_updated']
        
        with open(self.sponsors_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sponsors)

if __name__ == "__main__":
    engine = SponsorService()
    print("🚀 Starting Sponsor Outreach Service with OpenAI...")
    engine.run_full_process()