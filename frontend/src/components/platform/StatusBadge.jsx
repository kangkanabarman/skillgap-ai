import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  applied: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  shortlisted: "bg-primary/15 text-primary border-primary/30",
  under_review: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  selected: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function StatusBadge({ status }) {
  const key = (status || "applied").toLowerCase();
  return (
    <Badge variant="outline" className={`capitalize ${STATUS_STYLES[key] || ""}`}>
      {(status || "applied").replace(/_/g, " ")}
    </Badge>
  );
}
