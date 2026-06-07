import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import SkillTags from "./SkillTags";
import MatchScoreCard from "./MatchScoreCard";
import { Button } from "@/components/ui/button";

export default function JobDetailDialog({ job, open, onOpenChange, onApply }) {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{job.title}</DialogTitle>
          <p className="text-muted-foreground">{job.company_name}</p>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{job.job_type}</Badge>
          <Badge variant="outline">{job.work_mode}</Badge>
          {job.location && <Badge variant="outline">{job.location}</Badge>}
          {job.salary && <Badge variant="outline">{job.salary}</Badge>}
          {job.stipend && <Badge variant="outline">Stipend: {job.stipend}</Badge>}
        </div>
        {job.recommended_match_score > 0 && (
          <div className="glass-card rounded-xl p-4">
            <MatchScoreCard
              finalScore={job.recommended_match_score}
              semanticScore={job.preview_semantic_score}
              tfidfScore={job.preview_tfidf_score}
              skillScore={job.preview_skill_score}
              compact={false}
            />
          </div>
        )}
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Required Skills</h4>
          <SkillTags skills={job.required_skills} />
        </div>
        {(job.preferred_skills?.length > 0) && (
          <div>
            <h4 className="font-semibold mb-2">Preferred Skills</h4>
            <SkillTags skills={job.preferred_skills} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {job.minimum_cgpa && <p><span className="text-muted-foreground">Min CGPA:</span> {job.minimum_cgpa}</p>}
          {job.experience_required && <p><span className="text-muted-foreground">Experience:</span> {job.experience_required}</p>}
          {job.application_deadline && <p><span className="text-muted-foreground">Deadline:</span> {job.application_deadline}</p>}
          {job.openings && <p><span className="text-muted-foreground">Openings:</span> {job.openings}</p>}
        </div>
        <Button className="w-full glow-primary" onClick={() => { onOpenChange(false); onApply?.(job); }}>
          Apply Now
        </Button>
      </DialogContent>
    </Dialog>
  );
}
