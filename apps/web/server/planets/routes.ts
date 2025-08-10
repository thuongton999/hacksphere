import type { Express } from "express";

interface TeamMapData {
  id: string;
  awards: number;
  centroid: [number, number];
  track: string;
  myTeam: boolean;
}

interface InvestorMapData {
  id: string;
  interests: string[];
  chips: number;
  competitor: boolean;
}

export function registerPlanetRoutes(app: Express) {
  // Planet Home data for Voronoi map
  app.get("/api/v1/planets/map/teams", async (req, res) => {
    try {
      // In production, this would fetch from database
      const mockTeamMapData: TeamMapData[] = [
        {
          id: "1",
          awards: 85,
          centroid: [400, 300],
          track: "AI/ML",
          myTeam: true
        },
        {
          id: "2", 
          awards: 62,
          centroid: [600, 200],
          track: "Web3",
          myTeam: false
        },
        {
          id: "3",
          awards: 78,
          centroid: [300, 500],
          track: "Mobile",
          myTeam: false
        },
        {
          id: "4",
          awards: 43,
          centroid: [700, 400],
          track: "IoT",
          myTeam: false
        },
        {
          id: "5",
          awards: 91,
          centroid: [500, 600],
          track: "FinTech",
          myTeam: false
        }
      ];

      res.json(mockTeamMapData);
    } catch (error) {
      console.error("Error fetching team map data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Investor map data
  app.get("/api/v1/planets/map/investors", async (req, res) => {
    try {
      const mockInvestorMapData: InvestorMapData[] = [
        {
          id: "inv1",
          interests: ["AI", "Healthcare", "EdTech"],
          chips: 45,
          competitor: false
        },
        {
          id: "inv2",
          interests: ["Web3", "DeFi", "Gaming"],
          chips: 32,
          competitor: true
        },
        {
          id: "inv3",
          interests: ["Climate", "Sustainability", "Energy"],
          chips: 28,
          competitor: false
        },
        {
          id: "inv4", 
          interests: ["FinTech", "B2B", "Enterprise"],
          chips: 51,
          competitor: true
        }
      ];

      res.json(mockInvestorMapData);
    } catch (error) {
      console.error("Error fetching investor map data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI-powered investment matches
  app.get("/api/v1/planets/match/investors", async (req, res) => {
    try {
      // This would use AI matching in production
      const mockMatches = [
        {
          team: { id: "1", name: "Neural Networks" },
          land: {
            id: "1",
            title: "AI Study Buddy",
            tagline: "Personalized learning with AI",
            badges: ["AI", "EdTech", "Mobile"],
            totalChips: 67
          },
          totalChips: 67,
          chipCount: 8,
          score: 92
        },
        {
          team: { id: "3", name: "Quantum Leap" },
          land: {
            id: "3", 
            title: "Health Monitor Pro",
            tagline: "Real-time health tracking",
            badges: ["HealthTech", "IoT", "Mobile"],
            totalChips: 54
          },
          totalChips: 54,
          chipCount: 6,
          score: 87
        }
      ];

      res.json(mockMatches);
    } catch (error) {
      console.error("Error fetching AI matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Investor account info
  app.get("/api/v1/planets/investors/account", async (req, res) => {
    try {
      const mockAccount = {
        chipsRemainingDaily: 7,
        totalChipsAllocated: 45,
        introRequestsRemaining: 5,
        portfolioValue: 12400
      };

      res.json(mockAccount);
    } catch (error) {
      console.error("Error fetching investor account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}