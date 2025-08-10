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
import { Upload, Edit, Download, ExternalLink, Github, Play, FileText } from "lucide-react";
import type { Submission } from "@/types";

export default function Submissions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-mid-grey text-dark-grey";
      case "submitted":
        return "bg-primary-blue text-white";
      case "under_review":
        return "bg-warning text-white";
      case "reviewed":
        return "bg-success text-white";
      default:
        return "bg-mid-grey text-dark-grey";
    }
  };

  const mockSubmissions = [
    {
      id: "1",
      teamId: "team1",
      title: "AI-Powered Study Assistant",
      description: "An intelligent learning companion that adapts to individual learning styles using machine learning algorithms. Features include personalized study plans, progress tracking, and interactive quizzes.",
      status: "submitted",
      repoUrl: "https://github.com/team/study-assistant",
      demoUrl: "https://study-assistant.demo.com",
      videoUrl: "https://youtube.com/watch?v=demo",
      submittedAt: "2024-03-15T14:30:00",
      createdAt: "2024-03-14T10:00:00",
    },
    {
      id: "2",
      teamId: "team2",
      title: "Green Energy Monitor",
      description: "IoT-based solution for monitoring and optimizing energy consumption in residential buildings.",
      status: "draft",
      repoUrl: "https://github.com/team/energy-monitor",
      demoUrl: null,
      videoUrl: null,
      submittedAt: null,
      createdAt: "2024-03-15T09:00:00",
    },
  ];

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar 
          title="Submissions"
          actions={
            <Button 
              className="bg-primary-blue text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              data-testid="button-new-submission"
            >
              <Upload className="w-4 h-4 mr-2" />
              New Submission
            </Button>
          }
        />
        
        <main className="p-6">
          {/* Submission Guidelines */}
          <Card className="mb-8 border-l-4 border-primary-blue">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-deep-navy mb-3" data-testid="guidelines-title">
                Submission Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark-grey">
                <div>
                  <h4 className="font-medium text-deep-navy mb-2">Required Components:</h4>
                  <ul className="space-y-1">
                    <li>• Project repository (GitHub)</li>
                    <li>• Demo video (max 3 minutes)</li>
                    <li>• Working prototype/demo</li>
                    <li>• Project documentation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-deep-navy mb-2">Submission Deadline:</h4>
                  <p className="text-warm-coral font-medium">March 17, 2024 at 11:59 PM PST</p>
                  <p className="mt-2">Late submissions will not be accepted.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-6">
            {submissionsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-dark-grey">Loading submissions...</p>
              </div>
            ) : mockSubmissions.length > 0 ? (
              mockSubmissions.map((submission) => (
                <Card key={submission.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-deep-navy mb-1" data-testid={`submission-title-${submission.id}`}>
                          {submission.title}
                        </h3>
                        <p className="text-sm text-dark-grey">
                          Created: {new Date(submission.createdAt).toLocaleDateString()}
                          {submission.submittedAt && (
                            <> • Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      <Badge className={getStatusColor(submission.status)} data-testid={`submission-status-${submission.id}`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-dark-grey mb-4" data-testid={`submission-description-${submission.id}`}>
                      {submission.description}
                    </p>

                    {/* Submission Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {submission.repoUrl && (
                        <div className="flex items-center p-3 bg-soft-grey rounded-xl">
                          <Github className="w-5 h-5 text-dark-grey mr-3" />
                          <div>
                            <div className="text-sm font-medium text-deep-navy">Repository</div>
                            <a 
                              href={submission.repoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary-blue hover:underline"
                              data-testid={`link-repo-${submission.id}`}
                            >
                              View on GitHub
                            </a>
                          </div>
                        </div>
                      )}

                      {submission.demoUrl && (
                        <div className="flex items-center p-3 bg-soft-grey rounded-xl">
                          <ExternalLink className="w-5 h-5 text-dark-grey mr-3" />
                          <div>
                            <div className="text-sm font-medium text-deep-navy">Live Demo</div>
                            <a 
                              href={submission.demoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary-blue hover:underline"
                              data-testid={`link-demo-${submission.id}`}
                            >
                              Open Demo
                            </a>
                          </div>
                        </div>
                      )}

                      {submission.videoUrl && (
                        <div className="flex items-center p-3 bg-soft-grey rounded-xl">
                          <Play className="w-5 h-5 text-dark-grey mr-3" />
                          <div>
                            <div className="text-sm font-medium text-deep-navy">Demo Video</div>
                            <a 
                              href={submission.videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary-blue hover:underline"
                              data-testid={`link-video-${submission.id}`}
                            >
                              Watch Video
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
                          data-testid={`button-edit-${submission.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-download-${submission.id}`}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>

                      {submission.status === "draft" && (
                        <Button 
                          className="bg-primary-blue text-white hover:bg-blue-600"
                          data-testid={`button-submit-${submission.id}`}
                        >
                          Submit Project
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-mid-grey mx-auto mb-4" />
                <h3 className="text-lg font-medium text-deep-navy mb-2">No submissions yet</h3>
                <p className="text-dark-grey mb-4">Start by creating your first project submission.</p>
                <Button 
                  className="bg-primary-blue text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  data-testid="button-create-first-submission"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Create Submission
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
