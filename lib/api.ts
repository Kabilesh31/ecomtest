export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchHeroSlides() {
  const res = await fetch(`${API_BASE}/api/hero`);
  if (!res.ok) throw new Error("Failed to fetch hero slides");
  return res.json();
}