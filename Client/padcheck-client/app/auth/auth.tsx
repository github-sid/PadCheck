"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const Auth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function getRedirectUrl() {
    return returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, provider: "email", display_name: displayName.trim() || null }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail ?? "Registration failed");
        }
        setMode("signin");
        setPassword("");
        setError(null);
        return;
      }

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Sign in failed");
      }
      router.push(getRedirectUrl());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  function handleGoogleSignIn() {
    const redirect = getRedirectUrl();
    window.location.href = `${API_BASE}/auth/google?return_url=${encodeURIComponent(redirect)}`;
  }

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
  };

  return (
    <div className="min-h-screen bg-brand-surface text-neutral-800 font-sans">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-20">
        <h1 className="text-3xl font-serif font-medium text-neutral-900 mb-2">
          {mode === "signin" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm text-neutral-500 mb-8">
          {mode === "signin"
            ? "Sign in to write and manage reviews."
            : "Sign up to start reviewing properties."}
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded-xl ring-1 ring-neutral-200 bg-white text-sm font-medium text-neutral-700 mb-6 hover:bg-neutral-50"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs uppercase tracking-wider text-neutral-400">or</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 px-1">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={mode === "signup" ? 8 : 6}
            required
            className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
          />
          {mode === "signup" && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              minLength={8}
              required
              className="w-full p-3 text-sm bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-neutral-300"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-primary text-white font-medium text-sm disabled:opacity-50"
          >
            {loading
              ? mode === "signin"
                ? "Signing in…"
                : "Creating account…"
              : mode === "signin"
                ? "Sign in"
                : "Sign up"}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          className="mt-6 text-sm text-neutral-500 underline underline-offset-4"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};
