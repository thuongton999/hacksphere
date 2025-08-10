import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function SkillsFilter() {
  const [activeSkills, setActiveSkills] = useState<string[]>(["AI/ML"]);

  const skills = [
    "AI/ML",
    "Blockchain", 
    "Frontend",
    "Backend",
    "Design",
    "IoT",
    "Data Science",
  ];

  const toggleSkill = (skill: string) => {
    setActiveSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <Card className="bg-white rounded-2xl shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-deep-navy mb-4" data-testid="skills-filter-title">
          Filter by Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              className={`cursor-pointer transition-colors ${
                activeSkills.includes(skill)
                  ? "bg-primary-blue text-white"
                  : "bg-mid-grey text-dark-grey hover:bg-primary-blue hover:text-white"
              }`}
              onClick={() => toggleSkill(skill)}
              data-testid={`skill-filter-${skill.toLowerCase().replace('/', '-').replace(' ', '-')}`}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
