import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

type ReviewRow = {
  id: string;
  property_id: string;
  title: string;
  body: string;
  rating_landlord: number;
  rating_value: number;
  rating_neighborhood: number;
  rating_maintenance: number;
  created_at: string;
  properties: { address: string; city: string } | null;
};

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, created_at")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["my-reviews", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ReviewRow[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, property_id, title, body, rating_landlord, rating_value, rating_neighborhood, rating_maintenance, created_at, properties(address, city)"
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ReviewRow[];
    },
  });

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, avatar_url: avatarUrl || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    qc.invalidateQueries({ queryKey: ["my-reviews", user?.id] });
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#fcfcfb]">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-6 py-20 text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  const avgRating = (r: ReviewRow) =>
    (r.rating_landlord + r.rating_value + r.rating_neighborhood + r.rating_maintenance) / 4;

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-neutral-800 font-sans">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <header className="flex items-center gap-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover ring-1 ring-black/5" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-200 grid place-items-center text-lg font-medium text-neutral-600">
              {(displayName || user.email || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-serif font-medium text-neutral-900">
              {displayName || user.email}
            </h1>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
        </header>

        <section className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Edit profile</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1.5">
                Display name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1.5">
                Avatar URL
              </label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 rounded-xl bg-[#2d332d] text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-900 mb-4">
            Your reviews {reviews ? `(${reviews.length})` : ""}
          </h2>
          {reviews && reviews.length === 0 ? (
            <p className="text-sm text-neutral-500">You haven't posted any reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews?.map((r) => (
                <li key={r.id} className="bg-white rounded-2xl ring-1 ring-black/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to="/property/$id"
                        params={{ id: r.property_id }}
                        className="text-sm font-medium text-neutral-900 hover:underline flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {r.properties?.address ?? "Property"}{r.properties?.city ? `, ${r.properties.city}` : ""}
                      </Link>
                      <h3 className="mt-2 font-serif text-lg text-neutral-900">{r.title}</h3>
                      <p className="mt-1 text-sm text-neutral-600 line-clamp-3">{r.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-sm font-medium text-neutral-900">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {avgRating(r).toFixed(1)}
                      </div>
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="text-xs text-neutral-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-neutral-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
