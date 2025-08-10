import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Search, Bell } from "lucide-react";
import { ReactNode } from "react";

interface TopBarProps {
  title: string;
  actions?: ReactNode;
}

export default function TopBar({ title, actions }: TopBarProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-mid-grey px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="lg:hidden mr-4 p-2 hover:bg-soft-grey rounded-lg"
            data-testid="mobile-menu-button"
          >
            <Menu className="w-5 h-5 text-deep-navy" />
          </Button>
          <h1 className="text-2xl font-bold text-deep-navy" data-testid="page-title">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-grey" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-mid-grey rounded-xl focus:outline-none focus:border-primary-blue w-64"
              data-testid="search-input"
            />
          </div>

          {/* Actions */}
          {actions && <div>{actions}</div>}

          {/* Notifications */}
          <Button
            variant="ghost"
            className="relative p-2 hover:bg-soft-grey rounded-xl transition-colors"
            data-testid="notifications-button"
          >
            <Bell className="w-5 h-5 text-deep-navy" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-warm-coral text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10" data-testid="user-avatar">
              <AvatarImage 
                src={user.profileImageUrl} 
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover"
              />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <div className="font-medium text-deep-navy text-sm" data-testid="user-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-dark-grey capitalize" data-testid="user-role">
                {user.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
