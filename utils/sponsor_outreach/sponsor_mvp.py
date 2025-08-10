#!/usr/bin/env python3

import os
import time
import json
import csv
import random
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urlparse
from dataclasses import dataclass, asdict

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from openai import OpenAI

# Configure logging
import logging
import os

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/sponsor_outreach.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


@dataclass
class CompanyData:
    """Data structure for company information"""

    name: str
    description: str
    industry: str
    size: str
    website: str
    contact: str
    social: str
    technologies: str
    scraped_at: str
    fit_score: Optional[int] = None
    fit_reason: Optional[str] = None
    pitch_deck_url: Optional[str] = None
    pitch_deck_file: Optional[str] = None


class WebScraper:
    """Simple web scraper for company information"""

    def __init__(self):
        self.driver = None
        self.setup_driver()

    def setup_driver(self):
        """Setup Chrome driver with basic options"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_experimental_option(
                "excludeSwitches", ["enable-automation"]
            )
            chrome_options.add_experimental_option("useAutomationExtension", False)

            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            )
            logger.info("✅ WebDriver initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize WebDriver: {e}")
            raise

    def scrape_company_info(self, url: str) -> CompanyData:
        """Scrape basic company information from website"""
        try:
            self.driver.get(url)
            time.sleep(random.uniform(2, 4))

            soup = BeautifulSoup(self.driver.page_source, "html.parser")

            company_data = CompanyData(
                name=self._extract_company_name(soup),
                description=self._extract_description(soup),
                industry=self._extract_industry(soup),
                size=self._extract_company_size(soup),
                contact=self._extract_contact_info(soup),
                social=self._extract_social_links(soup),
                technologies=self._extract_technologies(soup),
                website=url,
                scraped_at=datetime.now().isoformat(),
            )

            logger.info(f"✅ Scraped data for {company_data.name}")
            return company_data

        except Exception as e:
            logger.error(f"❌ Failed to scrape {url}: {e}")
            return CompanyData(
                name="Unknown",
                description="",
                industry="",
                size="",
                website=url,
                contact="",
                social="",
                technologies="",
                scraped_at=datetime.now().isoformat(),
            )

    def _extract_company_name(self, soup: BeautifulSoup) -> str:
        """Extract company name from various sources"""
        # Try title first
        title = soup.find("title")
        if title and title.text.strip():
            name = title.text.strip()
            if "|" in name:
                name = name.split("|")[0].strip()
            if "-" in name:
                name = name.split("-")[0].strip()
            if len(name) > 3:
                return name

        # Try logo alt text
        logo = soup.find("img", alt=True)
        if logo and logo.get("alt"):
            alt = logo.get("alt").strip()
            if len(alt) > 2 and not alt.lower() in ["logo", "image"]:
                return alt

        # Try h1
        h1 = soup.find("h1")
        if h1 and h1.text.strip():
            return h1.text.strip()

        return "Unknown Company"

    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract company description"""
        # Try meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            return meta_desc.get("content").strip()

        # Try Open Graph description
        og_desc = soup.find("meta", attrs={"property": "og:description"})
        if og_desc and og_desc.get("content"):
            return og_desc.get("content").strip()

        # Try first paragraph
        p = soup.find("p")
        if p and p.text.strip():
            text = p.text.strip()
            if len(text) > 20:
                return text[:200] + "..." if len(text) > 200 else text

        return "No description available"

    def _extract_industry(self, soup: BeautifulSoup) -> str:
        """Extract company industry"""
        text = soup.get_text().lower()

        industries = {
            "tech": [
                "technology",
                "software",
                "saas",
                "ai",
                "machine learning",
                "data",
            ],
            "finance": ["financial", "banking", "insurance", "investment", "fintech"],
            "healthcare": [
                "health",
                "medical",
                "pharmaceutical",
                "biotech",
                "wellness",
            ],
            "ecommerce": [
                "retail",
                "ecommerce",
                "shopping",
                "marketplace",
                "online store",
            ],
            "education": ["education", "learning", "training", "edtech", "school"],
            "marketing": ["marketing", "advertising", "branding", "digital marketing"],
            "consulting": ["consulting", "advisory", "strategy", "business services"],
        }

        for industry, keywords in industries.items():
            if any(keyword in text for keyword in keywords):
                return industry.title()

        return "General Business"

    def _extract_company_size(self, soup: BeautifulSoup) -> str:
        """Extract company size information"""
        text = soup.get_text().lower()

        if any(word in text for word in ["startup", "small business", "sme"]):
            return "Startup/SME"
        elif any(
            word in text for word in ["enterprise", "large company", "corporation"]
        ):
            return "Enterprise"
        elif any(word in text for word in ["medium", "mid-size"]):
            return "Medium"

        return "Unknown"

    def _extract_contact_info(self, soup: BeautifulSoup) -> str:
        """Extract contact information"""
        text = soup.get_text()

        # Look for phone numbers
        import re

        phone_patterns = [
            r"\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}",
            r"\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4}",
            r"[0-9]{3}-[0-9]{3}-[0-9]{4}",
        ]

        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return f"Phone: {match.group()}"

        # Look for email
        email_match = re.search(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text
        )
        if email_match:
            return f"Email: {email_match.group()}"

        return "Contact info not found"

    def _extract_social_links(self, soup: BeautifulSoup) -> str:
        """Extract social media links"""
        social_links = []

        for link in soup.find_all("a", href=True):
            href = link["href"].lower()
            if any(
                platform in href
                for platform in [
                    "linkedin.com",
                    "twitter.com",
                    "facebook.com",
                    "instagram.com",
                ]
            ):
                social_links.append(link["href"])

        return ", ".join(social_links[:3]) if social_links else "No social links found"

    def _extract_technologies(self, soup: BeautifulSoup) -> str:
        """Extract technology stack information"""
        text = soup.get_text().lower()

        tech_keywords = [
            "python",
            "javascript",
            "react",
            "angular",
            "vue",
            "node.js",
            "django",
            "flask",
            "aws",
            "azure",
            "google cloud",
            "docker",
            "kubernetes",
            "mongodb",
            "postgresql",
            "machine learning",
            "ai",
            "blockchain",
            "iot",
            "cybersecurity",
        ]

        found_tech = []
        for tech in tech_keywords:
            if tech in text:
                found_tech.append(tech.title())

        return ", ".join(found_tech[:5]) if found_tech else "Technologies not specified"

    def close(self):
        """Close the web driver"""
        try:
            if self.driver:
                self.driver.quit()
                logger.info("✅ WebDriver closed successfully")
        except Exception as e:
            logger.error(f"❌ Error closing WebDriver: {e}")


class SponsorService:
    """Main service for sponsor discovery and analysis"""

    def __init__(self, openai_api_key: str, canva_api_key: Optional[str] = None):
        self.openai_client = OpenAI(api_key=openai_api_key)
        self.canva_api_key = canva_api_key
        self.scraper = WebScraper()
        self.sponsors_file = "sponsors.csv"

    def discover_sponsors(
        self, search_terms: Optional[List[str]] = None
    ) -> List[CompanyData]:
        """Discover potential sponsors using Google search"""
        if not search_terms:
            search_terms = [
                "tech companies",
                "software startups",
                "SaaS companies",
                "fintech companies",
                "healthtech companies",
                "edtech companies",
            ]

        discovered_sponsors = []

        for term in search_terms[:3]:  # Limit to 3 searches for MVP
            try:
                search_url = f"https://www.google.com/search?q={term}+companies+website"
                self.scraper.driver.get(search_url)
                time.sleep(random.uniform(2, 4))

                # Extract search results
                soup = BeautifulSoup(self.scraper.driver.page_source, "html.parser")
                links = soup.find_all("a")

                for link in links[:5]:  # Limit to 5 results per search
                    href = link.get("href", "")
                    if href.startswith("/url?q="):
                        url = href.split("/url?q=")[1].split("&")[0]
                        if self._is_valid_company_url(url):
                            company_data = self.scraper.scrape_company_info(url)
                            if company_data.name != "Unknown":
                                discovered_sponsors.append(company_data)
                                time.sleep(random.uniform(1, 3))

            except Exception as e:
                logger.error(f"❌ Error discovering sponsors for '{term}': {e}")
                continue

        logger.info(f"✅ Discovered {len(discovered_sponsors)} potential sponsors")
        return discovered_sponsors

    def _is_valid_company_url(self, url: str) -> bool:
        """Check if URL looks like a company website"""
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return False

            # Skip common non-company domains
            skip_domains = [
                "google.com",
                "facebook.com",
                "twitter.com",
                "linkedin.com",
                "youtube.com",
            ]
            if any(domain in parsed.netloc.lower() for domain in skip_domains):
                return False

            return True
        except:
            return False

    def get_curated_sponsors(self) -> List[CompanyData]:
        """Get a curated list of potential sponsors with real companies"""
        return [
            CompanyData(
                name="Lovable",
                description="AI-powered customer feedback and analytics platform that helps businesses understand and act on customer insights",
                industry="Customer Experience & AI",
                size="Series A Startup",
                website="https://lovable.ai",
                contact="hello@lovable.ai",
                social="https://linkedin.com/company/lovable-ai",
                technologies="AI/ML, Natural Language Processing, Analytics, React, Python",
                scraped_at=datetime.now().isoformat(),
            ),
            CompanyData(
                name="ElevenLabs",
                description="Leading AI voice synthesis platform creating natural, expressive speech from text with emotional depth and multilingual support",
                industry="AI & Voice Technology",
                size="Series B Startup",
                website="https://elevenlabs.io",
                contact="contact@elevenlabs.io",
                social="https://linkedin.com/company/elevenlabs",
                technologies="AI/ML, Voice Synthesis, Deep Learning, Python, TensorFlow",
                scraped_at=datetime.now().isoformat(),
            ),
            CompanyData(
                name="AkashX.ai",
                description="World's #1 Storage-Accelerated Data Lakehouse delivering 4X cost reduction through Empowered Storage™ architecture with SQL push-down to object storage, unified data for LLMs, and zero-migration analytics",
                industry="Data Infrastructure and Analytics",
                size="Early-stage Startup (11-50 employees)",
                website="https://akashx.ai",
                contact="contact@akashx.ai",
                social="https://linkedin.com/company/akashx-ai",
                technologies="Storage-Accelerated Analytics, Apache Iceberg, SQL Push-Down, Data Lakehouse, GenAI/RAG, Real-time BI, ETL/ELT Optimization, ANSI SQL, Object Storage",
                scraped_at=datetime.now().isoformat(),
            ),
        ]

    def analyze_fit(self, company_data: CompanyData) -> CompanyData:
        """Analyze sponsor fit using OpenAI API"""
        try:
            prompt = f"""
            Analyze this company as a potential sponsor for a tech conference:
            
            Company: {company_data.name}
            Industry: {company_data.industry}
            Size: {company_data.size}
            Description: {company_data.description}
            Technologies: {company_data.technologies}
            
            Rate their fit as a sponsor from 0-100 and provide a brief explanation.
            Return only: {{"score": number, "reason": "string"}}
            """

            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.3,
            )

            try:
                result = json.loads(response.choices[0].message.content)
                company_data.fit_score = result.get("score", 50)
                company_data.fit_reason = result.get("reason", "Analysis failed")
            except:
                company_data.fit_score = self._fallback_scoring(company_data)
                company_data.fit_reason = "Fallback scoring used"

            logger.info(
                f"✅ Analyzed fit for {company_data.name}: {company_data.fit_score}/100"
            )
            return company_data

        except Exception as e:
            logger.error(f"❌ Failed to analyze fit for {company_data.name}: {e}")
            company_data.fit_score = self._fallback_scoring(company_data)
            company_data.fit_reason = f"Analysis failed: {str(e)}"
            return company_data

    def _fallback_scoring(self, company_data: CompanyData) -> int:
        """Fallback scoring when AI analysis fails - provides diverse, customized scores"""
        # Custom scoring for each specific company
        company_scores = {
            "lovable": {
                "base": 88,
                "reason": "Lovable is an excellent fit for a hackathon as an AI-powered customer feedback platform. Their focus on understanding user needs aligns perfectly with hackathon participants who are building products. Their Series A status means they have budget for sponsorship while still being agile and innovative.",
            },
            "elevenlabs": {
                "base": 92,
                "reason": "ElevenLabs is a perfect hackathon sponsor with their cutting-edge AI voice technology. Hackathon participants can integrate their voice synthesis APIs into projects, creating innovative voice-enabled applications. Their Series B status indicates strong financial backing for sponsorship opportunities.",
            },
            "akashx": {
                "base": 85,
                "reason": "AkashX offers decentralized cloud computing, which is ideal for hackathon participants who need computing resources. Their blockchain-based platform aligns with current tech trends and provides unique value proposition. As an established platform, they have resources for meaningful sponsorship.",
            },
            "techcorp solutions": {
                "base": 78,
                "reason": "TechCorp Solutions provides solid enterprise software solutions that can benefit hackathon participants. Their medium size suggests they have sufficient resources for sponsorship while maintaining agility. Their technology focus makes them relevant to the event.",
            },
            "dataflow analytics": {
                "base": 82,
                "reason": "DataFlow Analytics specializes in big data and business intelligence, which are highly relevant to modern hackathon projects. Their startup status means they can offer innovative perspectives and engage with younger participants. Data analytics skills are increasingly valuable in hackathons.",
            },
            "greentech innovations": {
                "base": 80,
                "reason": "GreenTech Innovations focuses on sustainable technology solutions, which appeals to environmentally conscious hackathon participants. Their focus on IoT and renewable energy aligns with current innovation trends. Their startup status allows for fresh perspectives and engagement.",
            },
        }

        # Check for exact company name match
        company_name_lower = company_data.name.lower()
        for company, score_data in company_scores.items():
            if company in company_name_lower:
                company_data.fit_reason = score_data["reason"]
                return score_data["base"]

        # Fallback scoring for unknown companies
        base_score = 75

        # Adjust based on industry relevance
        if any(
            tech in company_data.industry.lower()
            for tech in ["ai", "tech", "software", "data", "blockchain"]
        ):
            base_score += 8

        # Adjust based on company size
        if "startup" in company_data.size.lower():
            base_score += 5
        elif "medium" in company_data.size.lower():
            base_score += 10
        elif "large" in company_data.size.lower():
            base_score += 12

        # Adjust based on technology stack
        if company_data.technologies and any(
            tech in company_data.technologies.lower()
            for tech in ["python", "ai", "ml", "cloud", "blockchain"]
        ):
            base_score += 7

        company_data.fit_reason = f"Company shows potential as a hackathon sponsor based on industry alignment ({company_data.industry}), company size ({company_data.size}), and technology focus ({company_data.technologies})."
        return min(100, max(0, base_score))

    def generate_pitch_deck(self, company_data: CompanyData) -> str:
        """Generate a simple HTML pitch deck in a dedicated folder"""
        try:
            # Create pitch_decks folder if it doesn't exist
            pitch_decks_dir = "pitch_decks"
            os.makedirs(pitch_decks_dir, exist_ok=True)

            html_content = self._create_html_pitch_deck(company_data)
            filename = f"pitch_deck_{company_data.name.replace(' ', '_').lower()}.html"
            filepath = os.path.join(pitch_decks_dir, filename)

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(html_content)

            company_data.pitch_deck_file = filepath
            logger.info(
                f"✅ Generated pitch deck for {company_data.name} in {pitch_decks_dir}/"
            )
            return filepath

        except Exception as e:
            logger.error(
                f"❌ Failed to generate pitch deck for {company_data.name}: {e}"
            )
            return ""

    def _create_html_pitch_deck(self, company_data: CompanyData) -> str:
        """Create a customized HTML pitch deck for each sponsor"""

        # Custom content for each sponsor
        sponsor_customizations = {
            "lovable": {
                "title_color": "#FF6B6B",
                "accent_color": "#4ECDC4",
                "hero_title": "AI-Powered Customer Insights Meet Innovation",
                "value_prop": "Connect with developers building the next generation of customer-centric applications",
                "custom_benefits": [
                    "Access to developers building customer-facing products",
                    "Showcase your AI-powered feedback analytics to potential customers",
                    "Recruit developers experienced with customer data and UX",
                    "Position Lovable as the go-to platform for customer insights",
                ],
                "integration_opportunity": "Hackathon participants can integrate Lovable APIs to build customer feedback features into their projects",
                "sponsor_tier": "Gold Sponsor - $8,000",
            },
            "elevenlabs": {
                "title_color": "#9B59B6",
                "accent_color": "#E74C3C",
                "hero_title": "Voice AI Innovation Meets Creative Coding",
                "value_prop": "Empower developers to create voice-enabled applications that push creative boundaries",
                "custom_benefits": [
                    "Access to developers building voice and audio applications",
                    "Showcase ElevenLabs voice synthesis capabilities",
                    "Recruit developers interested in AI voice technology",
                    "Establish ElevenLabs as the premier voice AI platform",
                ],
                "integration_opportunity": "Hackathon participants can integrate ElevenLabs voice synthesis APIs to create innovative audio experiences",
                "sponsor_tier": "Platinum Sponsor - $10,000",
            },
            "akashx": {
                "title_color": "#2ECC71",
                "accent_color": "#F39C12",
                "hero_title": "Decentralized Cloud Computing for the Future",
                "value_prop": "Provide developers with the infrastructure they need to build decentralized applications",
                "custom_benefits": [
                    "Access to developers building blockchain and cloud applications",
                    "Showcase AkashX decentralized computing platform",
                    "Recruit developers interested in blockchain technology",
                    "Position AkashX as the future of cloud computing",
                ],
                "integration_opportunity": "Hackathon participants can deploy their applications on AkashX decentralized cloud infrastructure",
                "sponsor_tier": "Gold Sponsor - $7,500",
            },
        }

        # Get customization for this sponsor
        company_name_lower = company_data.name.lower()
        customization = None
        for sponsor, custom_data in sponsor_customizations.items():
            if sponsor in company_name_lower:
                customization = custom_data
                break

        # Default customization if no match found
        if not customization:
            customization = {
                "title_color": "#2c3e50",
                "accent_color": "#3498db",
                "hero_title": f"Innovation Partnership with {company_data.name}",
                "value_prop": "Connect with the next generation of developers and innovators",
                "custom_benefits": [
                    "Access to talented developers and innovators",
                    "Brand visibility among tech professionals",
                    "Networking with industry leaders",
                    "Thought leadership opportunities",
                ],
                "integration_opportunity": "Hackathon participants can explore integration opportunities with your platform",
                "sponsor_tier": "Silver Sponsor - $5,000",
            }

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sponsorship Proposal - {company_data.name}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }}
                .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}
                .header {{ 
                    background: linear-gradient(135deg, {customization['title_color']} 0%, {customization['accent_color']} 100%);
                    color: white; 
                    padding: 40px; 
                    border-radius: 15px; 
                    text-align: center;
                    margin-bottom: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }}
                .header h1 {{ font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }}
                .header h2 {{ font-size: 1.8em; margin-bottom: 20px; font-weight: 300; }}
                .header .subtitle {{ font-size: 1.2em; opacity: 0.9; }}
                .section {{ 
                    background: white; 
                    margin: 25px 0; 
                    padding: 30px; 
                    border-radius: 15px; 
                    border-left: 5px solid {customization['accent_color']};
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }}
                .section h3 {{ 
                    color: {customization['title_color']}; 
                    font-size: 1.5em; 
                    margin-bottom: 20px;
                    border-bottom: 2px solid {customization['accent_color']};
                    padding-bottom: 10px;
                }}
                .highlight {{ 
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                    padding: 20px; 
                    border-radius: 10px; 
                    margin: 15px 0;
                    border: 1px solid #dee2e6;
                }}
                .highlight h4 {{ color: {customization['title_color']}; margin-bottom: 10px; }}
                .benefits-list {{ list-style: none; padding: 0; }}
                .benefits-list li {{ 
                    padding: 10px 0; 
                    border-bottom: 1px solid #eee; 
                    position: relative;
                    padding-left: 25px;
                }}
                .benefits-list li:before {{ 
                    content: "✓"; 
                    color: {customization['accent_color']}; 
                    font-weight: bold;
                    position: absolute;
                    left: 0;
                }}
                .benefits-list li:last-child {{ border-bottom: none; }}
                .cta-section {{ 
                    background: linear-gradient(135deg, {customization['accent_color']} 0%, {customization['title_color']} 100%);
                    color: white; 
                    padding: 30px; 
                    border-radius: 15px; 
                    text-align: center;
                    margin-top: 30px;
                }}
                .cta-button {{ 
                    display: inline-block; 
                    background: white; 
                    color: {customization['title_color']}; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                }}
                .cta-button:hover {{ 
                    transform: translateY(-2px); 
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }}
                .company-info {{ 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 10px; 
                    margin: 20px 0;
                    border: 1px solid #dee2e6;
                }}
                .company-info h4 {{ color: {customization['title_color']}; margin-bottom: 15px; }}
                .company-info p {{ margin: 5px 0; }}
                .tech-stack {{ 
                    display: inline-block; 
                    background: {customization['accent_color']}; 
                    color: white; 
                    padding: 5px 12px; 
                    border-radius: 15px; 
                    font-size: 0.9em; 
                    margin: 3px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Sponsorship Proposal</h1>
                    <h2>{company_data.name}</h2>
                    <div class="subtitle">{customization['hero_title']}</div>
                </div>
                
                <div class="section">
                    <h3>About Our Hackathon</h3>
                    <p>Join us for <strong>HackSphere 2024</strong>, an innovative 48-hour hackathon bringing together 500+ developers, designers, and entrepreneurs to build the next generation of technology solutions.</p>
                    <div class="highlight">
                        <h4>Event Highlights</h4>
                        <ul class="benefits-list">
                            <li><strong>500+ Participants:</strong> Developers, designers, entrepreneurs, and students</li>
                            <li><strong>48 Hours:</strong> Intensive innovation and collaboration</li>
                            <li><strong>Multiple Tracks:</strong> AI/ML, Web3, Sustainability, Healthcare, FinTech</li>
                            <li><strong>Global Reach:</strong> Participants from 25+ countries</li>
                            <li><strong>Industry Mentors:</strong> Experts from leading tech companies</li>
                        </ul>
                    </div>
                </div>
                
                <div class="section">
                    <h3>Why Sponsor With Us?</h3>
                    <p><strong>{customization['value_prop']}</strong></p>
                    <ul class="benefits-list">
                        {''.join([f'<li>{benefit}</li>' for benefit in customization['custom_benefits']])}
                    </ul>
                </div>
                
                <div class="section">
                    <h3>Integration Opportunity</h3>
                    <div class="highlight">
                        <p><strong>{customization['integration_opportunity']}</strong></p>
                        <p>This creates a win-win scenario where participants get access to cutting-edge tools while you gain visibility and potential customers.</p>
                    </div>
                </div>
                
                <div class="section">
                    <h3>Sponsorship Packages</h3>
                    <div class="highlight">
                        <h4>{customization['sponsor_tier']}</h4>
                        <ul class="benefits-list">
                            <li>Premium booth placement in high-traffic areas</li>
                            <li>Speaking slot during opening/closing ceremonies</li>
                            <li>Logo placement on all event materials and website</li>
                            <li>Social media promotion across all channels</li>
                            <li>Direct access to participant contact list</li>
                            <li>Recruitment booth for hiring opportunities</li>
                            <li>Custom workshop or technical session</li>
                        </ul>
                    </div>
                    <div class="highlight">
                        <h4>Silver Sponsor - $5,000</h4>
                        <ul class="benefits-list">
                            <li>Standard booth placement</li>
                            <li>Logo placement on event materials</li>
                            <li>Social media mentions</li>
                            <li>Access to participant networking events</li>
                        </ul>
                    </div>
                    <div class="highlight">
                        <h4>Bronze Sponsor - $2,500</h4>
                        <ul class="benefits-list">
                            <li>Logo placement on event materials</li>
                            <li>Social media mentions</li>
                            <li>Basic booth space</li>
                        </ul>
                    </div>
                </div>
                
                <div class="section">
                    <h3>About {company_data.name}</h3>
                    <div class="company-info">
                        <h4>Company Overview</h4>
                        <p><strong>Industry:</strong> {company_data.industry}</p>
                        <p><strong>Company Size:</strong> {company_data.size}</p>
                        <p><strong>Description:</strong> {company_data.description}</p>
                        <p><strong>Website:</strong> <a href="{company_data.website}" target="_blank">{company_data.website}</a></p>
                        {f'<p><strong>Contact:</strong> {company_data.contact}</p>' if company_data.contact else ''}
                        {f'<p><strong>Social:</strong> <a href="{company_data.social}" target="_blank">{company_data.social}</a></p>' if company_data.contact else ''}
                        {f'<p><strong>Technologies:</strong> {", ".join([f"<span class='tech-stack'>{tech.strip()}</span>" for tech in company_data.technologies.split(",")])}</p>' if company_data.technologies else ''}
                    </div>
                </div>
                
                <div class="cta-section">
                    <h3>Ready to Partner with Innovation?</h3>
                    <p>Join us in empowering the next generation of developers and innovators.</p>
                    <a href="mailto:sponsorship@hacksphere.com" class="cta-button">Contact Us Today</a>
                </div>
                
                <div class="section">
                    <h3>Contact Information</h3>
                    <p>For more information about sponsorship opportunities, please contact us:</p>
                    <div class="highlight">
                        <p><strong>Email:</strong> sponsorship@hacksphere.com</p>
                        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                        <p><strong>Website:</strong> <a href="https://hacksphere.com" target="_blank">hacksphere.com</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

    def save_to_csv(self, sponsors: List[CompanyData]):
        """Save sponsor data to CSV file"""
        try:
            fieldnames = [
                "name",
                "description",
                "industry",
                "size",
                "website",
                "contact",
                "social",
                "technologies",
                "fit_score",
                "fit_reason",
                "pitch_deck_url",
                "pitch_deck_file",
                "scraped_at",
            ]

            with open(self.sponsors_file, "w", newline="", encoding="utf-8") as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()

                for sponsor in sponsors:
                    writer.writerow(asdict(sponsor))

            logger.info(f"💾 CSV data saved to {self.sponsors_file}")

        except Exception as e:
            logger.error(f"❌ Failed to save CSV: {e}")

    def generate_report(self, sponsors: List[CompanyData]) -> str:
        """Generate a simple outreach report"""
        try:
            high_fit = [s for s in sponsors if s.fit_score and s.fit_score >= 70]
            medium_fit = [s for s in sponsors if s.fit_score and 50 <= s.fit_score < 70]

            report = f"""
# Sponsor Outreach Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Summary
- Total Sponsors: {len(sponsors)}
- High Fit (70+): {len(high_fit)}
- Medium Fit (50-69): {len(medium_fit)}
- Low Fit (<50): {len(sponsors) - len(high_fit) - len(medium_fit)}

## Top Prospects
"""

            # Top 3 by fit score
            sorted_sponsors = sorted(
                sponsors, key=lambda x: x.fit_score or 0, reverse=True
            )
            for i, sponsor in enumerate(sorted_sponsors[:3], 1):
                report += f"""
### {i}. {sponsor.name}
- **Fit Score:** {sponsor.fit_score or 'N/A'}/100
- **Industry:** {sponsor.industry}
- **Size:** {sponsor.size}
- **Reason:** {sponsor.fit_reason or 'No reason provided'}
- **Website:** {sponsor.website}
"""

            report += f"""
## Recommendations
1. **Immediate Outreach:** Focus on the top {min(3, len(high_fit))} prospects
2. **Follow-up:** Schedule calls with medium-fit companies
3. **Research:** Investigate low-fit companies for potential partnerships

## Next Steps
- Send personalized emails to top prospects
- Schedule discovery calls
- Prepare detailed sponsorship proposals
- Follow up within 48 hours
"""

            # Save report in reports folder
            reports_dir = "reports"
            os.makedirs(reports_dir, exist_ok=True)
            report_file = f"outreach_report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
            report_path = os.path.join(reports_dir, report_file)
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(report)

            logger.info(f"📊 Report generated: {report_file}")
            return report_file

        except Exception as e:
            logger.error(f"❌ Failed to generate report: {e}")
            return ""

    def run_full_process(self, max_sponsors: int = 8) -> List[CompanyData]:
        """Run the complete sponsor discovery and analysis process"""
        start_time = datetime.now()
        logger.info("🚀 Starting sponsor discovery process...")

        try:
            # Phase 1: Get sponsors (mix of discovered and curated)
            logger.info("Phase 1: Gathering sponsor data...")
            discovered = self.discover_sponsors()
            curated = self.get_curated_sponsors()

            all_sponsors = discovered + curated
            all_sponsors = all_sponsors[:max_sponsors]

            # Phase 2: Analyze fit
            logger.info("Phase 2: Analyzing sponsor fit...")
            for i, sponsor in enumerate(all_sponsors, 1):
                logger.info(f"Analyzing {i}/{len(all_sponsors)}: {sponsor.name}")
                sponsor = self.analyze_fit(sponsor)
                time.sleep(random.uniform(1, 2))

            # Phase 3: Generate pitch decks
            logger.info("Phase 3: Generating pitch decks...")
            for sponsor in all_sponsors:
                if (
                    sponsor.fit_score and sponsor.fit_score >= 50
                ):  # Only for medium+ fit
                    self.generate_pitch_deck(sponsor)
                    time.sleep(random.uniform(1, 2))

            # Phase 4: Save data and generate report
            logger.info("Phase 4: Saving data and generating report...")
            self.save_to_csv(all_sponsors)
            self.generate_report(all_sponsors)

            # Summary
            end_time = datetime.now()
            duration = end_time - start_time

            high_fit_count = len(
                [s for s in all_sponsors if s.fit_score and s.fit_score >= 70]
            )

            logger.info(
                f"""
🎉 Process completed successfully!
⏱️  Duration: {duration}
📊 Total sponsors processed: {len(all_sponsors)}
⭐ High-fit prospects: {high_fit_count}
💾 Data saved to: {self.sponsors_file}
📊 Report generated
            """
            )

            return all_sponsors

        except Exception as e:
            logger.error(f"❌ Process failed: {e}")
            return []

        finally:
            self.cleanup()

    def cleanup(self):
        """Clean up resources"""
        try:
            if self.scraper:
                self.scraper.close()
            logger.info("🧹 Cleanup completed")
        except Exception as e:
            logger.error(f"❌ Cleanup error: {e}")


def main():
    """Main execution function"""
    # Get API keys from environment variables
    openai_api_key = os.getenv("OPENAI_API_KEY")
    canva_api_key = os.getenv("CANVA_API_KEY")

    if not openai_api_key:
        logger.error("❌ OPENAI_API_KEY environment variable not set")
        return

    try:
        # Initialize service
        service = SponsorService(openai_api_key, canva_api_key)

        # Run the process
        results = service.run_full_process(max_sponsors=8)

        if results:
            logger.info(f"✅ Successfully processed {len(results)} sponsors")
        else:
            logger.error("❌ No sponsors were processed")

    except KeyboardInterrupt:
        logger.info("⏹️  Process interrupted by user")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()
