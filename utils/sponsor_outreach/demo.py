#!/usr/bin/env python3

import csv
from datetime import datetime
from typing import List, Dict

class SponsorDemo:
    def __init__(self):
        self.sponsors_file = "sponsors.csv"
        self.pitches_dir = "pitches"
        
        self.event_data = {
            "name": "HackSphere 2025",
            "participants": 500,
            "demographics": "60% students, 25% professionals, 15% entrepreneurs",
            "focus": "AI, Web Dev, Mobile Apps",
            "date": "March 2025",
            "location": "San Francisco"
        }
    
    def get_demo_sponsors(self) -> List[Dict]:
        return [
            {"name": "GitHub", "domain": "github.com", "industry": "Developer Tools", "size": "1000+", "email": "partnerships@github.com", "website": "https://github.com", "fit_score": 90},
            {"name": "Vercel", "domain": "vercel.com", "industry": "Cloud/DevOps", "size": "100-500", "email": "partnerships@vercel.com", "website": "https://vercel.com", "fit_score": 80},
            {"name": "OpenAI", "domain": "openai.com", "industry": "AI/ML", "size": "500-1000", "email": "partnerships@openai.com", "website": "https://openai.com", "fit_score": 85},
            {"name": "Figma", "domain": "figma.com", "industry": "Design Tools", "size": "500-1000", "email": "partnerships@figma.com", "website": "https://figma.com", "fit_score": 70},
            {"name": "MongoDB", "domain": "mongodb.com", "industry": "Database", "size": "1000+", "email": "partnerships@mongodb.com", "website": "https://mongodb.com", "fit_score": 75}
        ]
    
    def generate_demo_pitch(self, sponsor: Dict) -> str:
        fit_score = sponsor['fit_score']
        
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
                <ul>
                    <li>Access to {self.event_data['participants']} top developers and designers</li>
                    <li>Early exposure to innovative projects in {self.event_data['focus']}</li>
                    <li>Talent recruitment from {self.event_data['demographics']}</li>
                    <li>Brand visibility in the developer community</li>
                </ul>
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
                Generated by SponsorReach AI (Demo Mode) • Confidential Partnership Proposal
            </div>
        </body>
        </html>
        """
        
        return html_content
    
    def run_demo(self):
        print("🎭 Running Sponsor Outreach Demo Mode...")
        print("   (No AI required - using pre-calculated scores)")
        
        sponsors = self.get_demo_sponsors()
        print(f"📋 Found {len(sponsors)} demo sponsors")
        
        print("\n🤖 Demo Sponsor Analysis:")
        for sponsor in sponsors:
            print(f"  • {sponsor['name']}: {sponsor['fit_score']}/100 - {sponsor['email']}")
        
        print("\n📝 Generating demo pitch decks...")
        for sponsor in sponsors:
            if sponsor['fit_score'] >= 70:
                print(f"  📄 Creating pitch for {sponsor['name']} (score: {sponsor['fit_score']})")
                pitch_html = self.generate_demo_pitch(sponsor)
                
                filename = f"{sponsor['name'].lower().replace(' ', '_')}_pitch.html"
                with open(f"{self.pitches_dir}/{filename}", "w") as f:
                    f.write(pitch_html)
        
        self.save_to_csv(sponsors)
        
        print(f"\n✅ Generated {len([s for s in sponsors if s['fit_score'] >= 70])} pitch decks")
        print(f"💾 Saved demo data to '{self.sponsors_file}'")
        print("🎉 Demo complete! Run with --hunt for real AI-powered analysis.")
    
    def save_to_csv(self, sponsors: List[Dict]):
        fieldnames = ['name', 'domain', 'industry', 'size', 'email', 'website', 'fit_score']
        
        with open(self.sponsors_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sponsors)

if __name__ == "__main__":
    demo = SponsorDemo()
    demo.run_demo()
