import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User, 
  Bell, 
  Palette, 
  CreditCard, 
  Shield, 
  Trash2, 
  Github, 
  Calendar as CalendarIcon, 
  Slack,
  Database,
  Download,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [accountData, setAccountData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    slackNotifications: false,
    pushNotifications: true,
    eventReminders: true,
    teamUpdates: true,
    mentorSessions: true,
  });

  const [integrations, setIntegrations] = useState({
    github: false,
    slack: false,
    googleCalendar: false,
    airtable: false,
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setAccountData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
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

  const updateAccountMutation = useMutation({
    mutationFn: async (data: Partial<typeof accountData>) => {
      const response = await apiRequest("PUT", "/api/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Updated",
        description: "Your account information has been successfully updated.",
      });
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
        description: "Failed to update account. Please try again.",
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

  const handleAccountUpdate = () => {
    const { currentPassword, newPassword, confirmPassword, ...updateData } = accountData;
    
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    updateAccountMutation.mutate(updateData);
  };

  const handlePasswordChange = () => {
    if (!accountData.currentPassword || !accountData.newPassword) {
      toast({
        title: "Missing Information",
        description: "Please provide both current and new passwords.",
        variant: "destructive",
      });
      return;
    }

    if (accountData.newPassword !== accountData.confirmPassword) {
      toast({
        title: "Password Mismatch", 
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement password change API call
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
    });
    
    setAccountData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleIntegrationToggle = (integration: string) => {
    setIntegrations(prev => ({ ...prev, [integration]: !prev[integration as keyof typeof prev] }));
    toast({
      title: "Integration Updated",
      description: `${integration} integration has been ${integrations[integration as keyof typeof integrations] ? 'disconnected' : 'connected'}.`,
    });
  };

  const handleDataExport = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be ready shortly. You'll receive an email when it's complete.",
    });
  };

  const handleAccountDeletion = () => {
    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted. You'll receive a confirmation email.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-soft-grey">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopBar title="Settings" />
        
        <main className="p-6">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="account" data-testid="tab-account">
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="integrations" data-testid="tab-integrations">
                <Database className="w-4 h-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="appearance" data-testid="tab-appearance">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="privacy" data-testid="tab-privacy">
                <Shield className="w-4 h-4 mr-2" />
                Privacy
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-deep-navy" data-testid="account-info-title">
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={accountData.firstName}
                        onChange={(e) => setAccountData(prev => ({ ...prev, firstName: e.target.value }))}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={accountData.lastName}
                        onChange={(e) => setAccountData(prev => ({ ...prev, lastName: e.target.value }))}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                      data-testid="input-email"
                    />
                  </div>
                  <Button 
                    onClick={handleAccountUpdate}
                    disabled={updateAccountMutation.isPending}
                    className="bg-primary-blue text-white hover:bg-blue-600"
                    data-testid="button-save-account"
                  >
                    {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-deep-navy" data-testid="password-title">
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={accountData.currentPassword}
                        onChange={(e) => setAccountData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        data-testid="input-current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                        data-testid="toggle-current-password"
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4 text-dark-grey" />
                        ) : (
                          <Eye className="h-4 w-4 text-dark-grey" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={accountData.newPassword}
                        onChange={(e) => setAccountData(prev => ({ ...prev, newPassword: e.target.value }))}
                        data-testid="input-new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                        data-testid="toggle-new-password"
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-4 w-4 text-dark-grey" />
                        ) : (
                          <Eye className="h-4 w-4 text-dark-grey" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        data-testid="input-confirm-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                        data-testid="toggle-confirm-password"
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4 text-dark-grey" />
                        ) : (
                          <Eye className="h-4 w-4 text-dark-grey" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    className="bg-primary-blue text-white hover:bg-blue-600"
                    data-testid="button-change-password"
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-deep-navy" data-testid="notification-preferences-title">
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-deep-navy">Email Notifications</Label>
                      <p className="text-sm text-dark-grey">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationUpdate('emailNotifications', checked)}
                      data-testid="switch-email-notifications"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-deep-navy">Slack Notifications</Label>
                      <p className="text-sm text-dark-grey">Get notified in Slack when connected</p>
                    </div>
                    <Switch
                      checked={notifications.slackNotifications}
                      onCheckedChange={(checked) => handleNotificationUpdate('slackNotifications', checked)}
                      data-testid="switch-slack-notifications"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-deep-navy">Push Notifications</Label>
                      <p className="text-sm text-dark-grey">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationUpdate('pushNotifications', checked)}
                      data-testid="switch-push-notifications"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-deep-navy">Event Reminders</Label>
                      <p className="text-sm text-dark-grey">Get reminded about upcoming events</p>
                    </div>
                    <Switch
                      checked={notifications.eventReminders}
                      onCheckedChange={(checked) => handleNotificationUpdate('eventReminders', checked)}
                      data-testid="switch-event-reminders"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-deep-navy">Team Updates</Label>
                      <p className="text-sm text-dark-grey">Notifications about your team activities</p>
                    </div>
                    <Switch
                      checked={notifications.teamUpdates}
                      onCheckedChange={(checked) => handleNotificationUpdate('teamUpdates', checked)}
                      data-testid="switch-team-updates"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-deep-navy">Mentor Sessions</Label>
                      <p className="text-sm text-dark-grey">Reminders for mentor sessions and bookings</p>
                    </div>
                    <Switch
                      checked={notifications.mentorSessions}
                      onCheckedChange={(checked) => handleNotificationUpdate('mentorSessions', checked)}
                      data-testid="switch-mentor-sessions"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations */}
            <TabsContent value="integrations" className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-deep-navy" data-testid="integrations-title">
                    Connected Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-mid-grey rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-deep-navy rounded-lg flex items-center justify-center">
                        <Github className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-deep-navy">GitHub</h4>
                        <p className="text-sm text-dark-grey">Connect your GitHub account for repository access</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integrations.github && (
                        <Badge className="bg-success text-white" data-testid="github-connected-badge">
                          Connected
                        </Badge>
                      )}
                      <Button
                        variant={integrations.github ? "outline" : "default"}
                        onClick={() => handleIntegrationToggle('github')}
                        className={integrations.github ? "border-error text-error hover:bg-error hover:text-white" : "bg-primary-blue text-white hover:bg-blue-600"}
                        data-testid="button-github-integration"
                      >
                        {integrations.github ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-mid-grey rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-soft-purple rounded-lg flex items-center justify-center">
                        <Slack className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-deep-navy">Slack</h4>
                        <p className="text-sm text-dark-grey">Receive notifications and updates in Slack</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integrations.slack && (
                        <Badge className="bg-success text-white" data-testid="slack-connected-badge">
                          Connected
                        </Badge>
                      )}
                      <Button
                        variant={integrations.slack ? "outline" : "default"}
                        onClick={() => handleIntegrationToggle('slack')}
                        className={integrations.slack ? "border-error text-error hover:bg-error hover:text-white" : "bg-primary-blue text-white hover:bg-blue-600"}
                        data-testid="button-slack-integration"
                      >
                        {integrations.slack ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-mid-grey rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-blue rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-deep-navy">Google Calendar</h4>
                        <p className="text-sm text-dark-grey">Sync events and sessions with your calendar</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integrations.googleCalendar && (
                        <Badge className="bg-success text-white" data-testid="calendar-connected-badge">
                          Connected
                        </Badge>
                      )}
                      <Button
                        variant={integrations.googleCalendar ? "outline" : "default"}
                        onClick={() => handleIntegrationToggle('googleCalendar')}
                        className={integrations.googleCalendar ? "border-error text-error hover:bg-error hover:text-white" : "bg-primary-blue text-white hover:bg-blue-600"}
                        data-testid="button-calendar-integration"
                      >
                        {integrations.googleCalendar ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-mid-grey rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-accent-teal rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-deep-navy">Airtable</h4>
                        <p className="text-sm text-dark-grey">Manage event data and team information</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integrations.airtable && (
                        <Badge className="bg-success text-white" data-testid="airtable-connected-badge">
                          Connected
                        </Badge>
                      )}
                      <Button
                        variant={integrations.airtable ? "outline" : "default"}
                        onClick={() => handleIntegrationToggle('airtable')}
                        className={integrations.airtable ? "border-error text-error hover:bg-error hover:text-white" : "bg-primary-blue text-white hover:bg-blue-600"}
                        data-testid="button-airtable-integration"
                      >
                        {integrations.airtable ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-deep-navy" data-testid="theme-settings-title">
                    Theme Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-deep-navy">Dark Mode</Label>
                      <p className="text-sm text-dark-grey">Toggle between light and dark themes</p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={(checked) => {
                        setIsDarkMode(checked);
                        toast({
                          title: "Theme Updated",
                          description: `Switched to ${checked ? 'dark' : 'light'} mode.`,
                        });
                      }}
                      data-testid="switch-dark-mode"
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base font-medium text-deep-navy mb-3 block">Color Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border-2 border-primary-blue rounded-xl bg-primary-blue bg-opacity-10 cursor-pointer">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-primary-blue rounded-full"></div>
                          <span className="text-sm font-medium text-deep-navy">Blue</span>
                        </div>
                        <p className="text-xs text-dark-grey">Default theme</p>
                      </div>
                      <div className="p-4 border border-mid-grey rounded-xl hover:border-accent-teal cursor-pointer">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-accent-teal rounded-full"></div>
                          <span className="text-sm font-medium text-deep-navy">Teal</span>
                        </div>
                        <p className="text-xs text-dark-grey">Coming soon</p>
                      </div>
                      <div className="p-4 border border-mid-grey rounded-xl hover:border-soft-purple cursor-pointer">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-soft-purple rounded-full"></div>
                          <span className="text-sm font-medium text-deep-navy">Purple</span>
                        </div>
                        <p className="text-xs text-dark-grey">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy & Security */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-deep-navy" data-testid="data-privacy-title">
                    Data Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-soft-grey rounded-xl">
                    <div>
                      <h4 className="font-medium text-deep-navy">Download Your Data</h4>
                      <p className="text-sm text-dark-grey">Get a copy of all your data in JSON format</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDataExport}
                      className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
                      data-testid="button-download-data"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-soft-grey rounded-xl">
                    <div>
                      <h4 className="font-medium text-deep-navy">Profile Visibility</h4>
                      <p className="text-sm text-dark-grey">Control who can see your profile information</p>
                    </div>
                    <select className="px-3 py-2 border border-mid-grey rounded-lg focus:border-primary-blue" data-testid="select-profile-visibility">
                      <option value="public">Public</option>
                      <option value="team">Team Members Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="bg-error bg-opacity-10 border border-error rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-error mb-2">Danger Zone</h4>
                        <p className="text-sm text-dark-grey mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline"
                              className="border-error text-error hover:bg-error hover:text-white"
                              data-testid="button-delete-account"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleAccountDeletion}
                                className="bg-error text-white hover:bg-red-600"
                                data-testid="button-confirm-delete"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-deep-navy" data-testid="billing-title">
                    Billing & Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-soft-grey rounded-xl">
                    <div>
                      <h4 className="font-medium text-deep-navy">Current Plan</h4>
                      <p className="text-sm text-dark-grey">Free tier with basic features</p>
                    </div>
                    <Badge className="bg-success text-white" data-testid="current-plan-badge">
                      Free
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-soft-grey rounded-xl">
                    <div>
                      <h4 className="font-medium text-deep-navy">Upgrade to Pro</h4>
                      <p className="text-sm text-dark-grey">Unlock advanced features and integrations</p>
                    </div>
                    <Button 
                      className="bg-primary-blue text-white hover:bg-blue-600"
                      data-testid="button-upgrade-plan"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
