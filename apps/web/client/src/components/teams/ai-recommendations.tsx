import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function AIRecommendations() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-soft-purple to-primary-blue text-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Sparkles className="w-6 h-6 mr-2" />
              🤖 AI Team Recommendations
            </h3>
            <p className="opacity-90 mb-4" data-testid="ai-recommendations-description">
              Based on your skills and interests, we found perfect teams for you!
            </p>
            <Button 
              className="bg-white text-soft-purple px-6 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              data-testid="find-my-team-button"
            >
              Find My Team
            </Button>
          </div>
          <div className="hidden md:block">
            <Sparkles className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
