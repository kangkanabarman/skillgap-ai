export default function SkillTags({ skills = [], variant = "matched", limit = 12 }) {
  if (!skills?.length) return <p className="text-sm text-muted-foreground">None detected</p>;
  const styles = variant === "missing"
    ? "bg-red-500/10 text-red-400 border-red-500/20"
    : "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="flex flex-wrap gap-2">
      {skills.slice(0, limit).map((skill) => (
        <span key={skill} className={`px-2.5 py-1 rounded-md text-xs border ${styles}`}>
          {skill}
        </span>
      ))}
      {skills.length > limit && (
        <span className="text-xs text-muted-foreground self-center">+{skills.length - limit} more</span>
      )}
    </div>
  );
}
