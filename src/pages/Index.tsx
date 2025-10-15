import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { SkillInput } from "@/components/SkillInput";
import { JobRoleSelector } from "@/components/JobRoleSelector";
import { SkillGapAnalysis } from "@/components/SkillGapAnalysis";
import { LearningResources } from "@/components/LearningResources";
import { MicroJobs } from "@/components/MicroJobs";
import { AICoach } from "@/components/AICoach";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface JobRole {
  id: string;
  title: string;
  requiredSkills: string[];
}

type Step = "hero" | "skills" | "role" | "analysis";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);

  const handleGetStarted = () => {
    setCurrentStep("skills");
  };

  const handleSkillsSubmit = (skills: string[]) => {
    setUserSkills(skills);
    setCurrentStep("role");
  };

  const handleRoleSelect = (role: JobRole) => {
    setSelectedRole(role);
    setCurrentStep("analysis");
  };

  const handleReset = () => {
    setCurrentStep("hero");
    setUserSkills([]);
    setSelectedRole(null);
  };

  const getMissingSkills = () => {
    if (!selectedRole) return [];
    return selectedRole.requiredSkills.filter(
      skill => !userSkills.some(
        userSkill => userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
  };

  const getMatchScore = () => {
    if (!selectedRole) return 0;
    const matchCount = selectedRole.requiredSkills.filter(
      skill => userSkills.some(
        userSkill => userSkill.toLowerCase() === skill.toLowerCase()
      )
    ).length;
    return Math.round((matchCount / selectedRole.requiredSkills.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep === "hero" && (
        <>
          <Hero onGetStarted={handleGetStarted} />
          <Features />
          <HowItWorks />
          <Testimonials />
          <CTA onGetStarted={handleGetStarted} />
        </>
      )}

      {currentStep !== "hero" && (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={handleReset}
            className="mb-4 bg-background hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </Button>

          {currentStep === "skills" && (
            <SkillInput onSkillsSubmit={handleSkillsSubmit} />
          )}

          {currentStep === "role" && (
            <JobRoleSelector onRoleSelect={handleRoleSelect} />
          )}

          {currentStep === "analysis" && selectedRole && (
            <>
              <SkillGapAnalysis
                userSkills={userSkills}
                requiredSkills={selectedRole.requiredSkills}
              />

              {getMissingSkills().length > 0 && (
                <LearningResources missingSkills={getMissingSkills()} />
              )}

              <MicroJobs userSkills={userSkills} />

              <AICoach
                userSkills={userSkills}
                targetRole={selectedRole.title}
                matchScore={getMatchScore()}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
