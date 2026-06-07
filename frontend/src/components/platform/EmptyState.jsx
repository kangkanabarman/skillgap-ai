export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="glass-card rounded-2xl p-12 text-center">
      {Icon && <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}
