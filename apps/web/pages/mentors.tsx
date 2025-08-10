import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Search, Calendar, Star, Clock, Users, Sparkles } from "lucide-react";
import type { User } from "@/types";

export default function Mentors() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: mentors = [], isLoading: mentorsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/mentors"],
    enabled: isAuthenticated,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-grey flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-grey">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock mentor data for demonstration
  const mockMentors = [
    {
      id: "1",
      firstName: "Dr. Sarah",
      lastName: "Chen",
      bio: "AI/ML expert with 10+ years in research and industry. Former Google AI researcher, currently CTO at TechStartup.",
      skills: ["AI/ML", "Python", "TensorFlow", "Computer Vision"],
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      sessions: 15,
      availability: "Available",
      expertise: "Artificial Intelligence",
    },
    {
      id: "2",
      firstName: "Prof. James",
      lastName: "Rodriguez",
      bio: "Full-stack developer and entrepreneur. Built 3 successful startups, mentor at Y Combinator.",
      skills: ["React", "Node.js", "AWS", "Startup Strategy"],
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      sessions: 23,
      availability: "Busy",
      expertise: "Full-Stack Development",
    },
    {
      id: "3",
      firstName: "Lisa",
      lastName: "Wang",
      bio: "Product design leader at Meta. Expert in UX research, design systems, and user-centered design.",
      skills: ["UI/UX Design", "Figma", "Design Systems", "User Research"],
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      sessions: 18,
      availability: "Available",
      expertise: "Product Design",
    },
  ];

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar title="Mentors" />
        
        <main className="p-6">
          {/* AI Mentor Matching */}
          <Card className="mb-8 bg-gradient-to-r from-soft-purple to-primary-blue text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <Sparkles className="w-6 h-6 mr-2" />
                    AI Mentor Matching
                  </h3>
                  <p className="opacity-90 mb-4">
                    Get personalized mentor recommendations based on your project and skills!
                  </p>
                  <Button 
                    className="bg-white text-soft-purple hover:bg-gray-100 transition-colors"
                    data-testid="button-ai-match"
                  >
                    Find My Perfect Mentor
                  </Button>
                </div>
                <div className="hidden md:block">
                  <GraduationCap className="w-16 h-16 opacity-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-grey" />
                <Input 
                  placeholder="Search mentors by name or expertise..." 
                  className="pl-10"
                  data-testid="input-search-mentors"
                />
              </div>
              <select 
                className="px-4 py-2 border border-mid-grey rounded-xl focus:border-primary-blue"
                data-testid="select-expertise"
              >
                <option value="">All Expertise Areas</option>
                <option value="ai">AI/Machine Learning</option>
                <option value="frontend">Frontend Development</option>
                <option value="backend">Backend Development</option>
                <option value="design">Product Design</option>
                <option value="blockchain">Blockchain</option>
                <option value="mobile">Mobile Development</option>
              </select>
              <select 
                className="px-4 py-2 border border-mid-grey rounded-xl focus:border-primary-blue"
                data-testid="select-availability"
              >
                <option value="">All Availability</option>
                <option value="available">Available Now</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary-blue text-white cursor-pointer" data-testid="filter-ai">AI/ML</Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-frontend">Frontend</Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-backend">Backend</Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-design">Design</Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-blockchain">Blockchain</Badge>
              <Badge variant="outline" className="cursor-pointer" data-testid="filter-mobile">Mobile</Badge>
            </div>
          </div>

          {/* Mentors Grid */}
          {mentorsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-dark-grey">Loading mentors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMentors.map((mentor) => (
                <Card key={mentor.id} className="shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    {/* Mentor Header */}
                    <div className="flex items-center mb-4">
                      <Avatar className="w-16 h-16 mr-4">
                        <AvatarImage src={mentor.profileImageUrl} alt={`${mentor.firstName} ${mentor.lastName}`} />
                        <AvatarFallback>{mentor.firstName[0]}{mentor.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-deep-navy" data-testid={`mentor-name-${mentor.id}`}>
                          {mentor.firstName} {mentor.lastName}
                        </h3>
                        <p className="text-sm text-dark-grey">{mentor.expertise}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-warning mr-1" />
                          <span className="text-sm font-medium" data-testid={`mentor-rating-${mentor.id}`}>
                            {mentor.rating}
                          </span>
                          <span className="text-sm text-dark-grey ml-2">
                            ({mentor.sessions} sessions)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-dark-grey mb-4" data-testid={`mentor-bio-${mentor.id}`}>
                      {mentor.bio}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {mentor.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs"
                          data-testid={`mentor-skill-${mentor.id}-${index}`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Availability Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          mentor.availability === "Available" ? "bg-success" : "bg-warning"
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          mentor.availability === "Available" ? "text-success" : "text-warning"
                        }`} data-testid={`mentor-availability-${mentor.id}`}>
                          {mentor.availability}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-dark-grey">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>30 min sessions</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-primary-blue text-white hover:bg-blue-600"
                        disabled={mentor.availability === "Busy"}
                        data-testid={`button-book-${mentor.id}`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
                        data-testid={`button-profile-${mentor.id}`}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* My Sessions */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-deep-navy mb-4" data-testid="my-sessions-title">
                My Upcoming Sessions
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-soft-grey rounded-xl">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-deep-navy">Dr. Sarah Chen</div>
                      <div className="text-sm text-dark-grey">AI/ML Guidance • Tomorrow, 2:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-reschedule-session-1"
                    >
                      Reschedule
                    </Button>
                    <Button 
                      className="bg-accent-teal text-white hover:bg-teal-600" 
                      size="sm"
                      data-testid="button-join-session-1"
                    >
                      Join Session
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-soft-grey rounded-xl">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" />
                      <AvatarFallback>JR</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-deep-navy">Prof. James Rodriguez</div>
                      <div className="text-sm text-dark-grey">Product Strategy • Friday, 4:30 PM</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-reschedule-session-2"
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-accent-teal text-accent-teal" 
                      size="sm"
                      data-testid="button-prepare-session-2"
                    >
                      Prepare
                    </Button>
                  </div>
                </div>
              </div>

              {/* Empty state would go here if no sessions */}
            </CardContent>
          </Card>

          {/* Empty State for Mentors */}
          {mockMentors.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-mid-grey mx-auto mb-4" />
              <h3 className="text-lg font-medium text-deep-navy mb-2">No mentors available</h3>
              <p className="text-dark-grey">Mentors will appear here once they join the event.</p>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
