import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Share, Plus, Image as ImageIcon, Users } from "lucide-react";
import type { CommunityPost } from "@/types";

export default function Community() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [postContent, setPostContent] = useState("");

  const { data: posts = [], isLoading: postsLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts"],
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

  if (!isAuthenticated || !user) {
    return null;
  }

  // Mock posts for demonstration
  const mockPosts = [
    {
      id: "1",
      content: "Just deployed our AI study assistant prototype! The machine learning model is performing better than expected. Looking forward to the demo tomorrow! 🚀",
      author: {
        firstName: "Alex",
        lastName: "Johnson", 
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        role: "participant",
      },
      likes: 12,
      createdAt: "2024-03-15T10:30:00",
      tags: ["AI/ML", "Update"],
    },
    {
      id: "2",
      content: "Mentor office hours are now open! I'm available to help with blockchain development, smart contracts, and DeFi protocols. Book a session through the mentors page.",
      author: {
        firstName: "Dr. Sarah",
        lastName: "Chen",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
        role: "mentor",
      },
      likes: 8,
      createdAt: "2024-03-15T09:15:00",
      tags: ["Mentorship", "Blockchain"],
    },
    {
      id: "3",
      content: "Great turnout at today's React workshop! For those who missed it, I've uploaded the slides and code examples to the GitHub repository. Link in the schedule.",
      author: {
        firstName: "Mike",
        lastName: "Rodriguez",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face", 
        role: "organizer",
      },
      likes: 15,
      createdAt: "2024-03-15T08:45:00",
      tags: ["Workshop", "React"],
    },
  ];

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    
    // TODO: Implement actual post creation
    toast({
      title: "Post Created",
      description: "Your post has been shared with the community!",
    });
    setPostContent("");
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "mentor":
        return "bg-accent-teal text-white";
      case "judge":
        return "bg-soft-purple text-white";
      case "organizer":
        return "bg-warning text-white";
      case "sponsor":
        return "bg-warm-coral text-white";
      default:
        return "bg-primary-blue text-white";
    }
  };

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar title="Community" />
        
        <main className="p-6">
          {/* Community Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-primary-blue text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Members</p>
                    <p className="text-2xl font-bold" data-testid="stat-active-members">1,247</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent-teal text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm">Posts Today</p>
                    <p className="text-2xl font-bold" data-testid="stat-posts-today">89</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-teal-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-success text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Connections Made</p>
                    <p className="text-2xl font-bold" data-testid="stat-connections">156</p>
                  </div>
                  <Heart className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <Card className="bg-white rounded-2xl shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.profileImageUrl} className="object-cover" />
                      <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your progress, ask questions, or celebrate wins..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="min-h-[80px] border-mid-grey rounded-xl resize-none"
                        data-testid="create-post-textarea"
                      />
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-dark-grey hover:text-primary-blue"
                            data-testid="add-image-button"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Photo
                          </Button>
                        </div>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!postContent.trim()}
                          className="bg-primary-blue text-white px-6 py-2 rounded-xl hover:bg-blue-600 disabled:opacity-50"
                          data-testid="create-post-button"
                        >
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-dark-grey">Loading posts...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {mockPosts.map((post) => (
                    <Card key={post.id} className="bg-white rounded-2xl shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author.profileImageUrl} className="object-cover" />
                            <AvatarFallback>{post.author.firstName[0]}{post.author.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-deep-navy" data-testid={`post-author-${post.id}`}>
                                {post.author.firstName} {post.author.lastName}
                              </span>
                              <Badge className={`text-xs ${getRoleColor(post.author.role)}`}>
                                {post.author.role}
                              </Badge>
                              <span className="text-sm text-dark-grey" data-testid={`post-time-${post.id}`}>
                                {formatTimeAgo(post.createdAt)}
                              </span>
                            </div>
                            <p className="text-dark-grey text-sm" data-testid={`post-content-${post.id}`}>
                              {post.content}
                            </p>
                          </div>
                        </div>

                        {/* Post Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="text-xs"
                              data-testid={`post-tag-${post.id}-${index}`}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Post Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-mid-grey">
                          <div className="flex items-center space-x-6">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-dark-grey hover:text-warm-coral flex items-center"
                              data-testid={`like-button-${post.id}`}
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              <span>{post.likes}</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-dark-grey hover:text-primary-blue flex items-center"
                              data-testid={`comment-button-${post.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              <span>Reply</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-dark-grey hover:text-accent-teal flex items-center"
                              data-testid={`share-button-${post.id}`}
                            >
                              <Share className="w-4 h-4 mr-1" />
                              <span>Share</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Discussion Channels */}
              <Card className="bg-white rounded-2xl shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-deep-navy mb-4" data-testid="channels-title">
                    Discussion Channels
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "General", count: 234, active: true },
                      { name: "AI/ML", count: 89, active: false },
                      { name: "Frontend", count: 67, active: false },
                      { name: "Backend", count: 45, active: false },
                      { name: "Design", count: 56, active: false },
                      { name: "Blockchain", count: 23, active: false },
                    ].map((channel, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                          channel.active ? 'bg-primary-blue bg-opacity-10' : 'hover:bg-soft-grey'
                        }`}
                        data-testid={`channel-${channel.name.toLowerCase()}`}
                      >
                        <span className={`font-medium ${
                          channel.active ? 'text-primary-blue' : 'text-deep-navy'
                        }`}>
                          #{channel.name}
                        </span>
                        <span className="text-sm text-dark-grey">Total {channel.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Members */}
              <Card className="bg-white rounded-2xl shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-deep-navy mb-4" data-testid="active-members-title">
                    Active Members
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "Alex Johnson", role: "participant", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
                      { name: "Dr. Sarah Chen", role: "mentor", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face" },
                      { name: "Mike Rodriguez", role: "organizer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
                    ].map((member, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-2 hover:bg-soft-grey rounded-lg cursor-pointer"
                        data-testid={`active-member-${index}`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} className="object-cover" />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-deep-navy text-sm">{member.name}</div>
                          <div className="text-xs text-dark-grey capitalize">{member.role}</div>
                        </div>
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
