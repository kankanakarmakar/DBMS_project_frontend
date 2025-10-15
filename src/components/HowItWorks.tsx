import { Card, CardContent } from "@/components/ui/card";
import { Upload, Target, BookOpen, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Upload className="w-8 h-8" />,
    title: "Share Your Skills",
    description: "Upload your resume or manually list your current abilities"
  },
  {
    number: "02",
    icon: <Target className="w-8 h-8" />,
    title: "Choose Your Goal",
    description: "Select your dream job role from our curated list"
  },
  {
    number: "03",
    icon: <BookOpen className="w-8 h-8" />,
    title: "Learn & Practice",
    description: "Follow AI-recommended courses and take on micro-jobs"
  },
  {
    number: "04",
    icon: <Rocket className="w-8 h-8" />,
    title: "Land Your Job",
    description: "Build portfolio, gain experience, get hired"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your career
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Card className="border-border/50 bg-gradient-card hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="text-6xl font-bold text-primary/10">
                    {step.number}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary -mt-2">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-secondary transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
