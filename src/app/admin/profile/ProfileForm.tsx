"use client";

import { useState } from "react";

type Profile = {
  id: string;
  name: string;
  tagline: string | null;
  bio: string | null;
  heroImage: string | null;
  heroVideo: string | null;
} | null;

export default function ProfileForm({
  profile,
}: {
  profile: Profile;
}) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setSaved(false);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          tagline: formData.get("tagline"),
          bio: formData.get("bio"),
          heroImage: formData.get("heroImage"),
          heroVideo: formData.get("heroVideo"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update profile."
        );
      }

      setSaved(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-12 space-y-6 rounded-[2rem] bg-white/50 p-7 sm:p-10"
    >
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
        >
          Artist name
        </label>

        <input
          id="name"
          name="name"
          required
          defaultValue={profile?.name ?? ""}
          placeholder="Kigula Jonathan Sedrak"
          className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
        />
      </div>

      {/* Tagline */}
      <div>
        <label
          htmlFor="tagline"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
        >
          Tagline
        </label>

        <input
          id="tagline"
          name="tagline"
          defaultValue={profile?.tagline ?? ""}
          placeholder="De Voice · Da Diva"
          className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
        >
          Biography
        </label>

        <textarea
          id="bio"
          name="bio"
          rows={10}
          defaultValue={profile?.bio ?? ""}
          placeholder="Artist biography..."
          className="mt-3 w-full resize-y rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm leading-7 outline-none focus:border-[#c9a24b]"
        />
      </div>

      {/* Hero image */}
      <div>
        <label
          htmlFor="heroImage"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
        >
          Hero image
        </label>

        <input
          id="heroImage"
          name="heroImage"
          defaultValue={profile?.heroImage ?? ""}
          placeholder="/hero.jpeg"
          className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
        />

        {profile?.heroImage && (
          <div className="mt-5 overflow-hidden rounded-2xl bg-[#16241f]">
            <img
              src={profile.heroImage}
              alt={profile.name}
              className="max-h-[400px] w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Hero video */}
      <div>
        <label
          htmlFor="heroVideo"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d1a17]/40"
        >
          Hero video
        </label>

        <input
          id="heroVideo"
          name="heroVideo"
          defaultValue={profile?.heroVideo ?? ""}
          placeholder="Optional video URL"
          className="mt-3 w-full rounded-xl border border-[#0d1a17]/10 bg-white/50 px-5 py-4 text-sm outline-none focus:border-[#c9a24b]"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-xl border border-[#0d1a17]/10 bg-[#0d1a17]/5 px-5 py-4 text-sm text-[#0d1a17]/70">
          Profile saved successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#0d1a17] px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] text-[#f2e9d8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving Profile..." : "Save Profile"}
      </button>
    </form>
  );
}