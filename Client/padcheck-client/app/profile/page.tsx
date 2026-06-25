"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Mail, Shield, Pencil } from "lucide-react";
import { Navbar } from "@/components/header";
import { Footer } from "@/components/footer";
import { useIsSignedIn, type AuthUser } from "@/lib/use-auth";
import { Spinner } from "@/components/spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
      <Icon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
      <div className="flex-1 flex items-baseline justify-between gap-4">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</span>
        <span className="text-sm text-neutral-800">{value}</span>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-neutral-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-neutral-200 rounded w-48" />
          <div className="h-4 bg-neutral-200 rounded w-36" />
        </div>
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-3">
          <div className="h-4 bg-neutral-200 rounded w-24 mb-4" />
          {[0, 1, 2].map((j) => (
            <div key={j} className="h-8 bg-neutral-100 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

function getInitials(user: AuthUser): string {
  if (user.display_name) {
    return user.display_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return user.email[0].toUpperCase();
}

function EditForm({ user, recheckAuth }: { user: AuthUser; recheckAuth: () => void }) {
  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ display_name: displayName.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveMsg({ ok: false, text: data.detail ?? "Failed to save" });
      } else {
        setSaveMsg({ ok: true, text: "Saved" });
        recheckAuth();
      }
    } catch {
      setSaveMsg({ ok: false, text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
      <h2 className="text-base font-semibold text-neutral-900 mb-5 flex items-center gap-2">
        <Pencil className="w-4 h-4 text-neutral-400" />
        Edit profile
      </h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1.5">
            Display name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-5 rounded-xl bg-[#2d332d] text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Spinner />}
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saveMsg && (
            <p className={`text-sm ${saveMsg.ok ? "text-green-600" : "text-red-600"}`}>
              {saveMsg.text}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loggedIn, recheckAuth, user] = useIsSignedIn();

  useEffect(() => {
    if (loggedIn === false) {
      router.push("/auth?returnUrl=/profile");
    }
  }, [loggedIn, router]);

  return (
    <div className="min-h-screen bg-brand-surface text-neutral-800 font-sans">
      <Navbar />

      <section className="py-16 sm:py-12 px-6 sm:px-12">
        {!user ? (
          <ProfileSkeleton />
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">

            {/* ── Header ── */}
            <header className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-neutral-200 grid place-items-center text-lg font-semibold text-neutral-600 select-none shrink-0">
                {getInitials(user)}
              </div>
              <div>
                <h1 className="text-2xl font-serif font-medium text-neutral-900">
                  {user.display_name ?? user.email}
                </h1>
                <p className="text-sm text-neutral-500">{user.email}</p>
                <p className="mt-0.5 text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Member since{" "}
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </header>

            {/* ── Account info ── */}
            <section className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Account</h2>
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow
                icon={Shield}
                label="Sign-in method"
                value={user.provider === "gmail" ? "Google" : "Email & password"}
              />
              <InfoRow
                icon={Calendar}
                label="Member since"
                value={new Date(user.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              {user.role !== "user" && (
                <InfoRow icon={Shield} label="Role" value={user.role} />
              )}
            </section>

            {/* ── Edit profile ── */}
            <EditForm user={user} recheckAuth={recheckAuth} />

          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
