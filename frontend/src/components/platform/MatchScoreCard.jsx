import { Progress } from "@/components/ui/progress";

export default function MatchScoreCard({ finalScore, semanticScore, tfidfScore, skillScore, compact = false }) {
  const score = finalScore ?? 0;
  const color = score >= 75 ? "text-primary" : score >= 50 ? "text-yellow-400" : "text-red-400";

  if (compact) {
    return (
      <div className="text-right">
        <p className={`text-2xl font-bold ${color}`}>{score}%</p>
        <p className="text-xs text-muted-foreground">Match</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Final Match</p>
          <p className={`text-4xl font-bold ${color}`}>{score}%</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Semantic</span><span>{semanticScore ?? 0}%</span>
          </div>
          <Progress value={semanticScore ?? 0} className="h-1.5" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>TF-IDF</span><span>{tfidfScore ?? 0}%</span>
          </div>
          <Progress value={tfidfScore ?? 0} className="h-1.5" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Skills</span><span>{skillScore ?? 0}%</span>
          </div>
          <Progress value={skillScore ?? 0} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}
