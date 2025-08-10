import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

export default function EventOverview() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-primary-blue to-light-blue text-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2" data-testid="event-title">
              TechHack 2024: AI Innovation
            </h3>
            <p className="opacity-90 mb-4" data-testid="event-description">
              Build the future with AI • San Francisco, CA
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm" data-testid="event-dates">March 15-17, 2024</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm" data-testid="event-location">Tech Hub Center</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold" data-testid="days-left">2</div>
            <div className="text-sm opacity-90">Days Left</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
