import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Upload, Calendar } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Find Team",
      description: "Join or create a team",
      icon: Users,
      color: "bg-primary-blue",
      href: "/teams",
    },
    {
      title: "Book Mentor",
      description: "Get expert guidance",
      icon: GraduationCap,
      color: "bg-accent-teal",
      href: "/mentors",
    },
    {
      title: "Submit Project",
      description: "Upload your work",
      icon: Upload,
      color: "bg-soft-purple",
      href: "/submissions",
    },
    {
      title: "View Schedule",
      description: "Check upcoming events",
      icon: Calendar,
      color: "bg-warning",
      href: "/schedule",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant="ghost"
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left group h-auto flex-col items-start"
            data-testid={`quick-action-${action.title.toLowerCase().replace(' ', '-')}`}
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-deep-navy mb-2">{action.title}</h4>
            <p className="text-sm text-dark-grey">{action.description}</p>
          </Button>
        );
      })}
    </div>
  );
}
