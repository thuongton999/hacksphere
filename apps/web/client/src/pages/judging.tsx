import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Award, Star, Eye, MessageSquare, Download } from "lucide-react";

export default function Judging() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (!isAuthenticated || user?.role !== "judge") {
    return (
      <div className="min-h-screen bg-soft-grey flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Award className="w-16 h-16 text-mid-grey mx-auto mb-4" />
            <h3 className="text-lg font-medium text-deep-navy mb-2">Access Restricted</h3>
            <p className="text-dark-grey">This page is only accessible to judges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const submissions = [
    {
      id: "1",
      title: "AI-Powered Study Assistant",
      team: "AI Innovators",
      description: "An intelligent learning companion that adapts to individual learning styles using machine learning algorithms.",
      category: "AI/ML",
      status: "pending",
      repoUrl: "https://github.com/team/study-assistant",
      demoUrl: "https://study-assistant.demo.com",
      videoUrl: "https://youtube.com/watch?v=demo",
    },
    {
      id: "2",
      title: "Blockchain Voting System",
      team: "Blockchain Pioneers",
      description: "A decentralized voting system ensuring transparency and security in democratic processes.",
      category: "Blockchain",
      status: "reviewed",
      repoUrl: "https://github.com/team/voting-system",
      demoUrl: "https://voting-demo.com",
      videoUrl: "https://youtube.com/watch?v=voting",
    },
  ];

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar 
          title="Judging"
          actions={
            <Button 
              variant="outline"
              className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
              data-testid="button-export-scores"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Scores
            </Button>
          }
        />
        
        <main className="p-6">
          {/* Judge Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-primary-blue text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Assigned Projects</p>
                    <p className="text-2xl font-bold" data-testid="stat-assigned">12</p>
                  </div>
                  <Award className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-success text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Completed</p>
                    <p className="text-2xl font-bold" data-testid="stat-completed">8</p>
                  </div>
                  <Star className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warning text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">In Progress</p>
                    <p className="text-2xl font-bold" data-testid="stat-progress">3</p>
                  </div>
                  <Eye className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent-teal text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm">Pending</p>
                    <p className="text-2xl font-bold" data-testid="stat-pending">1</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-teal-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions to Review */}
          <div className="space-y-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-deep-navy mb-1" data-testid={`submission-title-${submission.id}`}>
                        {submission.title}
                      </h3>
                      <p className="text-dark-grey">Team: {submission.team}</p>
                    </div>
                    <Badge 
                      className={
                        submission.status === "pending" 
                          ? "bg-warning text-white" 
                          : "bg-success text-white"
                      }
                      data-testid={`submission-status-${submission.id}`}
                    >
                      {submission.status === "pending" ? "Needs Review" : "Reviewed"}
                    </Badge>
                  </div>

                  <p className="text-dark-grey mb-4" data-testid={`submission-description-${submission.id}`}>
                    {submission.description}
                  </p>

                  <div className="flex items-center space-x-4 mb-6">
                    <Badge variant="outline">{submission.category}</Badge>
                    <a 
                      href={submission.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-blue hover:underline text-sm"
                      data-testid={`link-repo-${submission.id}`}
                    >
                      View Repository
                    </a>
                    <a 
                      href={submission.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-blue hover:underline text-sm"
                      data-testid={`link-demo-${submission.id}`}
                    >
                      View Demo
                    </a>
                    <a 
                      href={submission.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-blue hover:underline text-sm"
                      data-testid={`link-video-${submission.id}`}
                    >
                      Watch Video
                    </a>
                  </div>

                  {submission.status === "pending" && (
                    <div className="bg-soft-grey rounded-xl p-6">
                      <h4 className="font-semibold text-deep-navy mb-4">Scoring Rubric</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-deep-navy mb-2">
                            Innovation (1-10)
                          </label>
                          <Slider
                            defaultValue={[5]}
                            max={10}
                            min={1}
                            step={1}
                            className="mb-2"
                            data-testid={`slider-innovation-${submission.id}`}
                          />
                          <p className="text-xs text-dark-grey">Creativity and originality of the solution</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-deep-navy mb-2">
                            Technical Implementation (1-10)
                          </label>
                          <Slider
                            defaultValue={[5]}
                            max={10}
                            min={1}
                            step={1}
                            className="mb-2"
                            data-testid={`slider-technical-${submission.id}`}
                          />
                          <p className="text-xs text-dark-grey">Code quality and technical complexity</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-deep-navy mb-2">
                            Design & UX (1-10)
                          </label>
                          <Slider
                            defaultValue={[5]}
                            max={10}
                            min={1}
                            step={1}
                            className="mb-2"
                            data-testid={`slider-design-${submission.id}`}
                          />
                          <p className="text-xs text-dark-grey">User interface and experience design</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-deep-navy mb-2">
                            Presentation (1-10)
                          </label>
                          <Slider
                            defaultValue={[5]}
                            max={10}
                            min={1}
                            step={1}
                            className="mb-2"
                            data-testid={`slider-presentation-${submission.id}`}
                          />
                          <p className="text-xs text-dark-grey">Quality of demo and pitch</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-deep-navy mb-2">
                          Feedback Comments
                        </label>
                        <Textarea 
                          placeholder="Provide detailed feedback for the team..."
                          className="min-h-[100px]"
                          data-testid={`textarea-feedback-${submission.id}`}
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button 
                          className="bg-primary-blue text-white hover:bg-blue-600"
                          data-testid={`button-submit-review-${submission.id}`}
                        >
                          Submit Review
                        </Button>
                        <Button 
                          variant="outline"
                          data-testid={`button-save-draft-${submission.id}`}
                        >
                          Save as Draft
                        </Button>
                      </div>
                    </div>
                  )}

                  {submission.status === "reviewed" && (
                    <div className="bg-success bg-opacity-10 border border-success rounded-xl p-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-success mr-2" />
                        <span className="text-success font-medium">Review Completed</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {submissions.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-mid-grey mx-auto mb-4" />
              <h3 className="text-lg font-medium text-deep-navy mb-2">No submissions to review</h3>
              <p className="text-dark-grey">Submissions will appear here once they are assigned to you.</p>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
