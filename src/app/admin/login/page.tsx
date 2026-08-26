"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.message || "Login failed.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1a17] px-6 text-[#f2e9d8]">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#c9a24b]">
            De Voice
          </p>

          <h1 className="mt-5 font-serif text-5xl">
            Management
          </h1>

          <p className="mt-4 text-sm text-[#f2e9d8]/40">
            Sign in to manage the artist website.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-[#f2e9d8]/10 bg-[#f2e9d8]/[0.03] p-8"
        >
          <div>
            <label
              htmlFor="email"
              className="text-[10px] uppercase tracking-[0.25em] text-[#f2e9d8]/40"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-3 w-full rounded-xl border border-[#f2e9d8]/10 bg-[#f2e9d8]/[0.04] px-4 py-4 text-sm outline-none placeholder:text-[#f2e9d8]/20 focus:border-[#c9a24b]"
              placeholder="Management email"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="password"
              className="text-[10px] uppercase tracking-[0.25em] text-[#f2e9d8]/40"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-3 w-full rounded-xl border border-[#f2e9d8]/10 bg-[#f2e9d8]/[0.04] px-4 py-4 text-sm outline-none placeholder:text-[#f2e9d8]/20 focus:border-[#c9a24b]"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-full bg-[#f2e9d8] px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#0d1a17] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}