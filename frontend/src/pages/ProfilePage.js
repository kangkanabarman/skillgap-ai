import { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { client, authHeaders } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const role = localStorage.getItem("role") || "student";
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = role === "recruiter" ? "/platform/recruiter/profile" : "/platform/student/profile";
    client.get(endpoint, { headers: authHeaders() }).then((res) => {
      setProfile(res.data[role] || {});
    }).catch(() => toast.error("Failed to load profile")).finally(() => setLoading(false));
  }, [role]);

  const save = async () => {
    const endpoint = role === "recruiter" ? "/platform/recruiter/profile" : "/platform/student/profile";
    await client.patch(endpoint, profile, { headers: authHeaders() });
    toast.success("Profile updated");
  };

  return (
    <PortalLayout title="Profile" subtitle="Manage your account and role-specific information">
      {loading ? <p>Loading...</p> : (
        <div className="glass-card rounded-xl p-6 space-y-4">
          {Object.keys(profile).filter((k) => !["id", "user_id", "created_at", "updated_at", "parsed_resume_data", "recommended_jobs", "applied_jobs", "learning_recommendations", "posted_jobs"].includes(k)).map((key) => (
            <div key={key}>
              <Label className="capitalize">{key.replaceAll("_", " ")}</Label>
              <Input value={profile[key] ?? ""} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <Button onClick={save}>Save Changes</Button>
        </div>
      )}
    </PortalLayout>
  );
}
