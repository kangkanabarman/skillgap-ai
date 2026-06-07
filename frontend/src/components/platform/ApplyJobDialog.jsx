import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import MatchScoreCard from "./MatchScoreCard";
import SkillTags from "./SkillTags";
import { platformApi, getErrorMessage } from "@/services/platformApi";
import { toast } from "sonner";

export default function ApplyJobDialog({ job, open, onOpenChange, hasResume, onApplied }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setFile(null);
    setStep("form");
    setResult(null);
    setLoading(false);
  };

  const handleClose = (v) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const submit = async () => {
    if (!hasResume && !file) {
      toast.error("Please upload your resume to apply");
      return;
    }
    setLoading(true);
    try {
      const res = await platformApi.applyToJob(job.id, file || undefined);
      setResult(res.data.application);
      setStep("result");
      toast.success("Application submitted with AI analysis");
      onApplied?.(res.data.application);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Apply to {job.title}</DialogTitle>
              <DialogDescription>
                {job.company_name} • AI will analyze your resume against this job description
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {hasResume ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Resume on file — you can apply now or upload a newer version below
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-yellow-500/10 text-sm text-yellow-400">
                  Upload your resume (PDF/DOCX) to apply
                </div>
              )}
              <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">{file ? file.name : "Click to upload resume"}</p>
              </label>
              <Button className="w-full" onClick={submit} disabled={loading || (!hasResume && !file)}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running AI analysis...</> : "Submit Application"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Application Submitted</DialogTitle>
              <DialogDescription>Your AI match analysis for {job.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <MatchScoreCard
                finalScore={result?.final_match_score}
                semanticScore={result?.semantic_score}
                tfidfScore={result?.tfidf_score}
                skillScore={result?.skill_match_score}
              />
              <div>
                <p className="text-sm font-medium mb-2">Matched Skills</p>
                <SkillTags skills={result?.matched_skills} variant="matched" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Missing Skills</p>
                <SkillTags skills={result?.missing_skills} variant="missing" />
              </div>
              <p className="text-sm text-muted-foreground border-t border-border pt-3">{result?.ai_recommendation}</p>
              <Button className="w-full" onClick={() => handleClose(false)}>Done</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
