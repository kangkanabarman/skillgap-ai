import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  to,
  variant = "default",
  badge,
  delay = 0,
}) {
  const navigate = useNavigate();
  const isPrimary = variant === "primary";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={() => navigate(to)}
      className={`group text-left w-full glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden ${
        isPrimary ? "ring-1 ring-primary/40 bg-gradient-to-br from-primary/10 via-card/70 to-card/70" : ""
      }`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
            isPrimary ? "bg-primary/20 text-primary" : "bg-muted text-primary"
          }`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{title}</h3>
              {badge && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}
