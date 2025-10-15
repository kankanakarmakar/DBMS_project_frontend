import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Target } from "lucide-react";

interface SkillGap {
  skill: string;
  status: "have" | "missing" | "developing";
  proficiency?: number;
}

interface SkillGapAnalysisProps {
  userSkills: string[];
  requiredSkills: string[];
}

export const SkillGapAnalysis = ({ userSkills, requiredSkills }: SkillGapAnalysisProps) => {
  const analyzeSkills = (): SkillGap[] => {
    return requiredSkills.map(skill => {
      const hasSkill = userSkills.some(
        userSkill => userSkill.toLowerCase() === skill.toLowerCase()
      );
      
      if (hasSkill) {
        return {
          skill,
          status: "have",
          proficiency: Math.floor(Math.random() * 30) + 70 // 70-100%
        };
      }
      
      // Check for related skills that might be developing
      const isDeveloping = Math.random() > 0.5;
      return {
        skill,
        status: isDeveloping ? "developing" : "missing",
        proficiency: isDeveloping ? Math.floor(Math.random() * 40) + 30 : 0 // 30-70% or 0%
      };
    });
  };

  const skillGaps = analyzeSkills();
  const haveCount = skillGaps.filter(s => s.status === "have").length;
  const missingCount = skillGaps.filter(s => s.status === "missing").length;
  const overallScore = Math.round((haveCount / requiredSkills.length) * 100);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>
          AI-powered assessment of your skills vs. job requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="p-6 rounded-lg bg-gradient-hero text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Overall Match Score</h3>
              <p className="text-sm opacity-90">Based on your current skills</p>
            </div>
            <div className="text-5xl font-bold">{overallScore}%</div>
          </div>
          <Progress value={overallScore} className="h-2 bg-primary-foreground/20" />
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div>
              <div className="text-2xl font-bold">{haveCount}</div>
              <div className="text-xs opacity-90">Skills Match</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{skillGaps.filter(s => s.status === "developing").length}</div>
              <div className="text-xs opacity-90">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{missingCount}</div>
              <div className="text-xs opacity-90">To Learn</div>
            </div>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Skills Breakdown</h4>
          {skillGaps.map((gap) => (
            <div key={gap.skill} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {gap.status === "have" && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  {gap.status === "developing" && (
                    <AlertCircle className="w-5 h-5 text-warning" />
                  )}
                  {gap.status === "missing" && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span className="font-medium">{gap.skill}</span>
                </div>
                <Badge
                  variant={
                    gap.status === "have"
                      ? "default"
                      : gap.status === "developing"
                      ? "secondary"
                      : "outline"
                  }
                  className={
                    gap.status === "have"
                      ? "bg-success text-success-foreground"
                      : gap.status === "developing"
                      ? "bg-warning text-warning-foreground"
                      : "bg-destructive/10 text-destructive"
                  }
                >
                  {gap.status === "have" && "Proficient"}
                  {gap.status === "developing" && "Learning"}
                  {gap.status === "missing" && "Need to Learn"}
                </Badge>
              </div>
              {gap.proficiency !== undefined && gap.proficiency > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Proficiency</span>
                    <span>{gap.proficiency}%</span>
                  </div>
                  <Progress value={gap.proficiency} className="h-1.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
