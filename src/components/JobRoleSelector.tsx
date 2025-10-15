import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Briefcase, Palette, TrendingUp, Users, Megaphone } from "lucide-react";

interface JobRole {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  requiredSkills: string[];
}

const jobRoles: JobRole[] = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    icon: <Code className="w-6 h-6" />,
    description: "Build beautiful user interfaces",
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Responsive Design"]
  },
  {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    icon: <Briefcase className="w-6 h-6" />,
    description: "End-to-end application development",
    requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "REST APIs", "Git"]
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    icon: <Palette className="w-6 h-6" />,
    description: "Design engaging user experiences",
    requiredSkills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Design Systems"]
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    icon: <TrendingUp className="w-6 h-6" />,
    description: "Transform data into insights",
    requiredSkills: ["Python", "SQL", "Excel", "Data Visualization", "Statistics"]
  },
  {
    id: "project-manager",
    title: "Project Manager",
    icon: <Users className="w-6 h-6" />,
    description: "Lead teams to success",
    requiredSkills: ["Agile", "Scrum", "Communication", "Risk Management", "Leadership"]
  },
  {
    id: "digital-marketer",
    title: "Digital Marketer",
    icon: <Megaphone className="w-6 h-6" />,
    description: "Drive online growth",
    requiredSkills: ["SEO", "Google Analytics", "Content Marketing", "Social Media", "Email Marketing"]
  }
];

interface JobRoleSelectorProps {
  onRoleSelect: (role: JobRole) => void;
}

export const JobRoleSelector = ({ onRoleSelect }: JobRoleSelectorProps) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelect = (role: JobRole) => {
    setSelectedRole(role.id);
    onRoleSelect(role);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Choose Your Target Role</CardTitle>
        <CardDescription>
          Select the job role you're aiming for, and we'll analyze your skill gaps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobRoles.map((role) => (
            <Button
              key={role.id}
              variant={selectedRole === role.id ? "default" : "outline"}
              className={`h-auto p-6 flex flex-col items-start text-left space-y-3 transition-all ${
                selectedRole === role.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "hover:border-primary hover:shadow-md"
              }`}
              onClick={() => handleSelect(role)}
            >
              <div className="flex items-center gap-3 w-full">
                {role.icon}
                <h3 className="font-semibold text-lg">{role.title}</h3>
              </div>
              <p className="text-sm opacity-80">{role.description}</p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
