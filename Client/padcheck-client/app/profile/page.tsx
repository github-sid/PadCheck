import { Calendar, Mail, Shield, Pencil } from "lucide-react";
import { Navbar } from "@/components/header";
import { Footer } from "@/components/footer";

const STATIC_USER = {
  display_name: "Alex Morgan",
  email: "alex.morgan@example.com",
  provider: "email" as "email" | "gmail",
  role: "user" as "user" | "admin",
  member_since: "2025-03-12",
};

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

export default function ProfilePage() {
  const initials = STATIC_USER.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-brand-surface text-neutral-800 font-sans">
      <Navbar />

      <section className="py-16 sm:py-12 px-6 sm:px-12">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* ── Header ── */}
          <header className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-neutral-200 grid place-items-center text-lg font-semibold text-neutral-600 select-none shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-medium text-neutral-900">
                {STATIC_USER.display_name}
              </h1>
              <p className="text-sm text-neutral-500">{STATIC_USER.email}</p>
              <p className="mt-0.5 text-xs text-neutral-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Member since{" "}
                {new Date(STATIC_USER.member_since).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </header>

          {/* ── Account info ── */}
          <section className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-4">Account</h2>
            <InfoRow icon={Mail} label="Email" value={STATIC_USER.email} />
            <InfoRow
              icon={Shield}
              label="Sign-in method"
              value={STATIC_USER.provider === "gmail" ? "Google" : "Email & password"}
            />
            <InfoRow
              icon={Calendar}
              label="Member since"
              value={new Date(STATIC_USER.member_since).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />
            {STATIC_USER.role !== "user" && (
              <InfoRow icon={Shield} label="Role" value={STATIC_USER.role} />
            )}
          </section>

          {/* ── Edit profile ── */}
          <section className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-5 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-neutral-400" />
              Edit profile
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1.5">
                  Display name
                </label>
                <input
                  defaultValue={STATIC_USER.display_name}
                  className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-[#2d332d] text-white text-sm font-medium"
              >
                Save changes
              </button>
            </form>
          </section>

        </div>
      </section>

      <Footer />
    </div>
  );
}
