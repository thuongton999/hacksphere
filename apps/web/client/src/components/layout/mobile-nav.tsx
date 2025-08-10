import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Home, Users, Calendar, GraduationCap, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/teams", icon: Users, label: "Teams" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
    { href: "/mentors", icon: GraduationCap, label: "Mentors" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-mid-grey z-40">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 ${
                isActive ? 'text-primary-blue' : 'text-dark-grey'
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
