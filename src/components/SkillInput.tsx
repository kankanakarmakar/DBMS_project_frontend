import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SkillInputProps {
  // New: second optional param career is included for parents that expect it.
  // Backwards compatible: parents expecting only (skills) will still work.
  onSkillsSubmit: (skills: string[], career?: string) => void;
}

export const SkillInput = ({ onSkillsSubmit }: SkillInputProps) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [career, setCareer] = useState<string>(""); // NEW: career position selector

  const addSkill = () => {
    const val = currentSkill.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = () => {
    if (skills.length > 0) {
      // Call parent with both skills and career (career is optional)
      onSkillsSubmit(skills, career || undefined);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate resume parsing - in production, call an AI service
      const mockSkills = [
        "JavaScript", "React", "TypeScript", "Node.js", "CSS",
        "HTML", "Git", "REST APIs", "Problem Solving"
      ];
      setSkills(mockSkills);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Tell Us About Your Skills</CardTitle>
        <CardDescription>
          Upload your resume or manually add your current skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resume Upload */}
        <div className="space-y-2">
          <Label htmlFor="resume-upload" className="text-base">Upload Resume (Optional)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('resume-upload')?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </div>

        {/* Career Position (NEW) */}
        <div className="space-y-2">
          <Label htmlFor="career-select" className="text-base">Select Career Position</Label>
          <select
            id="career-select"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          >
            <option value="">-- Choose a Position --</option>
            <option value="software_engineer">Software Engineer</option>
            <option value="data_scientist">Data Scientist</option>
            <option value="project_manager">Project Manager</option>
            <option value="ui_ux_designer">UI/UX Designer</option>
            <option value="ai_researcher">AI Researcher</option>
            <option value="marketing_analyst">Marketing Analyst</option>
            <option value="devops_engineer">DevOps Engineer</option>
            <option value="qa_engineer">QA Engineer</option>
            <option value="business_analyst">Business Analyst</option>
          </select>
        </div>

        {/* Manual Skill Entry */}
        <div className="space-y-2">
          <Label htmlFor="skill-input" className="text-base">Or Add Skills Manually</Label>
          <div className="flex gap-2">
            <Input
              id="skill-input"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="e.g., JavaScript, Project Management"
              className="flex-1"
            />
            <Button onClick={addSkill} size="icon" variant="secondary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Skills Display */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base">Your Skills ({skills.length})</Label>
            <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg min-h-[80px]">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 text-sm flex items-center gap-2"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-destructive"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={skills.length === 0}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          Analyze My Skills
        </Button>
      </CardContent>
    </Card>
  );
};
