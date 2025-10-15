import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";
import aiCoachIcon from "@/assets/ai-coach-icon.png";

interface AICoachProps {
  userSkills: string[];
  targetRole: string;
  matchScore: number;
}

export const AICoach = ({ userSkills, targetRole, matchScore }: AICoachProps) => {
  const insights = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Focus Areas",
      message: matchScore < 50 
        ? "Start with foundational skills like HTML and CSS before moving to frameworks."
        : matchScore < 75
        ? "You're making good progress! Focus on practical projects to solidify your knowledge."
        : "Excellent progress! Now focus on advanced concepts and building a portfolio."
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Career Trajectory",
      message: "Based on your learning pace, you could be job-ready for entry-level positions in 3-4 months with consistent practice."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Pro Tip",
      message: "Take on micro-jobs even if you're not 100% confident. Real-world practice accelerates learning faster than courses alone."
    }
  ];

  const nextSteps = [
    "Complete the 'JavaScript Fundamentals' course (8 hours)",
    "Build 2-3 small projects to practice React",
    "Apply for 5 beginner-friendly micro-jobs",
    "Join developer communities on Discord or Reddit"
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-border/50 bg-gradient-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <img src={aiCoachIcon} alt="AI Coach" className="w-12 h-12" />
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-secondary" />
              Your AI Career Coach
            </CardTitle>
            <CardDescription>
              Personalized guidance for your {targetRole} journey
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insights */}
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-background border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="p-5 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Recommended Next Steps
          </h4>
          <ul className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Motivation */}
        <div className="text-center p-4 rounded-lg bg-gradient-hero text-primary-foreground">
          <p className="text-lg font-medium">
            "Every expert was once a beginner. Keep learning, keep building!"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
