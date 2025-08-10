import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Users, GraduationCap, Award, Settings, Briefcase } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleSignUp = () => {
    // Redirect to Replit Auth
    window.location.href = "/api/login";
  };

  const handleSignIn = () => {
    // Redirect to Replit Auth
    window.location.href = "/api/login";
  };

  const roleIcons = {
    participant: Users,
    mentor: GraduationCap,
    judge: Award,
    organizer: Settings,
    sponsor: Briefcase,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-grey to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" data-testid="logo-icon" />
            </div>
            <h1 className="text-3xl font-bold text-deep-navy mb-2" data-testid="title">
              HackSphere AI
            </h1>
            <p className="text-dark-grey" data-testid="subtitle">
              Join the future of hackathon management
            </p>
          </div>

          {/* Role Selection Card */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-deep-navy mb-6" data-testid="role-selection-title">
                Choose Your Role
              </h2>
              
              <div className="space-y-3 mb-6">
                {USER_ROLES.map((role) => {
                  const Icon = roleIcons[role.value as keyof typeof roleIcons];
                  const isSelected = selectedRole === role.value;
                  
                  return (
                    <Label 
                      key={role.value}
                      className={`flex items-center p-4 border-2 rounded-xl hover:border-light-blue transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-primary-blue bg-light-blue bg-opacity-10' 
                          : 'border-mid-grey'
                      }`}
                      data-testid={`role-option-${role.value}`}
                    >
                      <input 
                        type="radio" 
                        name="role" 
                        value={role.value} 
                        className="sr-only"
                        onChange={(e) => setSelectedRole(e.target.value)}
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${role.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-deep-navy">{role.label}</div>
                        <div className="text-sm text-dark-grey">{role.description}</div>
                      </div>
                    </Label>
                  );
                })}
              </div>

              {/* Signup Form */}
              <div className="space-y-4">
                <div>
                  <Input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full px-4 py-3 border border-mid-grey rounded-xl focus:outline-none focus:border-primary-blue transition-colors"
                    data-testid="input-fullname"
                  />
                </div>
                <div>
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full px-4 py-3 border border-mid-grey rounded-xl focus:outline-none focus:border-primary-blue transition-colors"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full px-4 py-3 border border-mid-grey rounded-xl focus:outline-none focus:border-primary-blue transition-colors"
                    data-testid="input-password"
                  />
                </div>
                <Button 
                  onClick={handleSignUp}
                  className="w-full bg-primary-blue text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200"
                  data-testid="button-signup"
                >
                  Create Account
                </Button>
              </div>

              <p className="text-center text-sm text-dark-grey mt-6">
                Already have an account? 
                <button 
                  onClick={handleSignIn}
                  className="text-primary-blue hover:underline ml-1"
                  data-testid="link-signin"
                >
                  Sign in
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
