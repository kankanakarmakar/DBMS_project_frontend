import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Briefcase, TrendingUp, Users, Zap } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI-Powered Analysis",
    description: "Advanced algorithms analyze your skills and identify gaps with precision"
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Free Learning Resources",
    description: "Curated courses from top platforms - all free and quality-verified"
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    title: "Micro-Job Matching",
    description: "Practice skills with real paid gigs matched to your level"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Career Roadmap",
    description: "Get a personalized step-by-step plan to reach your dream role"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community Support",
    description: "Connect with mentors and peers on the same journey"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Fast Results",
    description: "See improvements in weeks, not months, with targeted learning"
  }
];

export const Features = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powered by cutting-edge AI to accelerate your career growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-gradient-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
