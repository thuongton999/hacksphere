import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Zap, Users, Calendar, Upload, GraduationCap, MessageCircle, User, Settings, Home, Award, Globe } from "lucide-react";
import RoleBadge from "@/components/ui/role-badge";
import { NAVBAR_ITEMS } from "@/lib/constants";

const iconMap = {
  Home,
  Users,
  Calendar,
  Upload,
  GraduationCap,
  MessageCircle,
  User,
  Settings,
  Award,
  Globe,
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const menuItems = NAVBAR_ITEMS[user.role] || NAVBAR_ITEMS.participant;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-mid-grey z-30 lg:block hidden">
      <div className="p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center mb-8" data-testid="sidebar-logo">
          <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center mr-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-deep-navy">HackSphere</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            // Handle divider item
            if (item.type === "divider") {
              return <div key={index} className="h-px bg-gray-200 my-3 mx-2"></div>;
            }
            
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = location === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive 
                    ? 'bg-soft-grey text-deep-navy' 
                    : 'text-dark-grey hover:bg-soft-grey'
                }`}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.label === "Teams" && (
                  <span className="ml-auto bg-warm-coral text-white text-xs px-2 py-1 rounded-lg">3</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Badge */}
      <div className="absolute bottom-6 left-6 right-6">
        <RoleBadge user={user} />
      </div>
    </div>
  );
}
