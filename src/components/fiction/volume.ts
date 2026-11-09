/** A book on the shelf: a published work, or the placeholder volume when there are none. */
export interface Volume {
  slug: string;
  title: string;
  tagline: string;
  /** Synopsis rendered from markdown on the server. */
  synopsisHtml: string;
  genre: string;
  kind: string;
  progress: string;
  cover: string | null;
  chapters: { slug: string; title: string; summary: string; minutes: number }[];
  words: number;
  /** The "Short Stories" volume shown while nothing is published. */
  placeholder?: boolean;
}

const INTRO_LINE = /^\s*elsewhere,\s*i\s*write\s*fiction\.?\s*/i;

/** The intro setting often opens with the section's own title; drop the echo. */
export function introWithoutTitle(intro: string): string {
  const rest = intro.replace(INTRO_LINE, "").trim();
  return rest || intro;
}

export function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function kindLine(v: Pick<Volume, "kind" | "genre">): string {
  return [capitalize(v.kind), v.genre].filter(Boolean).join(" · ");
}

export function chapterCount(n: number): string {
  return `${n} ${n === 1 ? "chapter" : "chapters"}`;
}

export function toRoman(n: number): string {
  if (n <= 0 || n >= 4000) return String(n);
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [value, numeral] of map) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

export function placeholderVolume(intro: string): Volume {
  return {
    slug: "short-stories",
    title: "Short Stories",
    tagline: "Pull up a chair.",
    synopsisHtml: `<p>${escapeHtml(introWithoutTitle(intro))}</p>`,
    genre: "",
    kind: "collection",
    progress: "in the drafting room",
    cover: null,
    chapters: [],
    words: 0,
    placeholder: true,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
