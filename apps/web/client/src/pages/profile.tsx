import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Edit3, Github, Linkedin, Globe, Award, Calendar, Users, ExternalLink } from "lucide-react";
import { SKILLS } from "@/lib/constants";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    skills: [] as string[],
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
  });

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        skills: user.skills || [],
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        websiteUrl: user.websiteUrl || "",
      });
    }
  }, [user]);

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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PUT", "/api/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  // Mock data for achievements and activity
  const achievements = [
    { title: "Team Player", description: "Joined 3 teams", icon: Users, date: "March 2024" },
    { title: "Early Adopter", description: "First 100 users", icon: Award, date: "February 2024" },
    { title: "Active Contributor", description: "10+ community posts", icon: Calendar, date: "March 2024" },
  ];

  const recentActivity = [
    { action: "Joined team", target: "AI Innovators", time: "2 hours ago" },
    { action: "Submitted project", target: "Smart Study Assistant", time: "1 day ago" },
    { action: "Attended workshop", target: "React Best Practices", time: "2 days ago" },
  ];

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar 
          title="Profile"
          actions={
            !isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-primary-blue text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                data-testid="edit-profile-button"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  data-testid="cancel-edit-button"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-primary-blue text-white hover:bg-blue-600"
                  data-testid="save-profile-button"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )
          }
        />
        
        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white rounded-2xl shadow-md">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4" data-testid="profile-avatar">
                    <AvatarImage src={user.profileImageUrl} className="object-cover" />
                    <AvatarFallback className="text-2xl">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          data-testid="input-first-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-deep-navy mb-2" data-testid="profile-name">
                        {user.firstName} {user.lastName}
                      </h2>
                      <Badge className="bg-primary-blue text-white mb-4 capitalize" data-testid="profile-role">
                        {user.role}
                      </Badge>
                    </>
                  )}

                  {isEditing ? (
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="min-h-[80px]"
                        data-testid="input-bio"
                      />
                    </div>
                  ) : (
                    <p className="text-dark-grey text-sm mb-6" data-testid="profile-bio">
                      {user.bio || "No bio available"}
                    </p>
                  )}

                  {/* Social Links */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="githubUrl">GitHub URL</Label>
                        <Input
                          id="githubUrl"
                          value={formData.githubUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                          placeholder="https://github.com/username"
                          data-testid="input-github"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                        <Input
                          id="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                          placeholder="https://linkedin.com/in/username"
                          data-testid="input-linkedin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input
                          id="websiteUrl"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                          data-testid="input-website"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center space-x-4">
                      {user.githubUrl && (
                        <a 
                          href={user.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-dark-grey hover:text-primary-blue transition-colors"
                          data-testid="github-link"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {user.linkedinUrl && (
                        <a 
                          href={user.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-dark-grey hover:text-primary-blue transition-colors"
                          data-testid="linkedin-link"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {user.websiteUrl && (
                        <a 
                          href={user.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-dark-grey hover:text-primary-blue transition-colors"
                          data-testid="website-link"
                        >
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="skills" data-testid="tab-skills">Skills</TabsTrigger>
                  <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-white rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-deep-navy mb-4">Profile Stats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-blue" data-testid="stat-events">3</div>
                          <div className="text-sm text-dark-grey">Events Joined</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent-teal" data-testid="stat-teams">2</div>
                          <div className="text-sm text-dark-grey">Teams</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-soft-purple" data-testid="stat-projects">1</div>
                          <div className="text-sm text-dark-grey">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-warning" data-testid="stat-connections">24</div>
                          <div className="text-sm text-dark-grey">Connections</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-deep-navy mb-4">Recent Projects</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-soft-grey rounded-xl">
                          <div>
                            <h4 className="font-medium text-deep-navy" data-testid="project-title-1">AI-Powered Study Assistant</h4>
                            <p className="text-sm text-dark-grey">Team: AI Innovators • TechHack 2024</p>
                          </div>
                          <Button variant="outline" size="sm" data-testid="view-project-1">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6">
                  <Card className="bg-white rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-deep-navy mb-4">Skills & Expertise</h3>
                      {isEditing ? (
                        <div>
                          <p className="text-sm text-dark-grey mb-4">Select your skills:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {SKILLS.map((skill) => (
                              <Badge
                                key={skill}
                                className={`cursor-pointer transition-colors ${
                                  formData.skills.includes(skill)
                                    ? "bg-primary-blue text-white"
                                    : "bg-mid-grey text-dark-grey hover:bg-primary-blue hover:text-white"
                                }`}
                                onClick={() => toggleSkill(skill)}
                                data-testid={`skill-toggle-${skill.toLowerCase().replace('/', '-').replace(' ', '-')}`}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(user.skills || []).map((skill, index) => (
                            <Badge 
                              key={index}
                              className="bg-primary-blue text-white"
                              data-testid={`skill-${index}`}
                            >
                              {skill}
                            </Badge>
                          ))}
                          {(!user.skills || user.skills.length === 0) && (
                            <p className="text-dark-grey">No skills added yet</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <Card className="bg-white rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-deep-navy mb-4">Achievements</h3>
                      <div className="space-y-4">
                        {achievements.map((achievement, index) => {
                          const Icon = achievement.icon;
                          return (
                            <div 
                              key={index}
                              className="flex items-center space-x-4 p-4 bg-soft-grey rounded-xl"
                              data-testid={`achievement-${index}`}
                            >
                              <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center">
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-deep-navy">{achievement.title}</h4>
                                <p className="text-sm text-dark-grey">{achievement.description}</p>
                                <p className="text-xs text-dark-grey">{achievement.date}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card className="bg-white rounded-2xl shadow-md">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-deep-navy mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-4 border-l-4 border-primary-blue bg-soft-grey rounded-r-xl"
                            data-testid={`activity-${index}`}
                          >
                            <div>
                              <p className="font-medium text-deep-navy">
                                {activity.action} <span className="text-primary-blue">{activity.target}</span>
                              </p>
                            </div>
                            <span className="text-sm text-dark-grey">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
