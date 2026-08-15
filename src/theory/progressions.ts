import type { KeyMode } from "./roman";

/**
 * Curated chord progressions, tagged by mood/genre for filtering.
 *
 * `tokens` are roman numerals resolved against the user's chosen key by
 * `parseRomanToken` -- the progression itself is key-agnostic, which is why one
 * entry covers every key at once.
 *
 * User-authored progressions share this shape (minus the curation) and live in
 * localStorage; see `src/lib/storage.ts`.
 */
export interface Progression {
  readonly id: string;
  readonly name: string;
  readonly mode: KeyMode;
  readonly tokens: readonly string[];
  readonly tags: readonly string[];
  readonly description: string;
}

export const PROGRESSIONS: readonly Progression[] = [
  {
    id: "pop-axis",
    name: "Pop / Axis Progression",
    mode: "major",
    tokens: ["I", "V", "vi", "IV"],
    tags: ["major", "pop", "uplifting", "universal"],
    description:
      "The most-used chord loop in modern pop — bright, optimistic, and instantly familiar. If you can't decide what to write, this is the safe, singable default.",
  },
  {
    id: "pop-emotional",
    name: "Emotional Pop",
    mode: "major",
    tokens: ["vi", "IV", "I", "V"],
    tags: ["major", "pop", "emotional", "bittersweet"],
    description:
      "The exact same four chords as the Axis progression, just starting on the relative minor — it lands more introspective and bittersweet before lifting into the major chords.",
  },
  {
    id: "rock-blues",
    name: "Classic Rock / Blues",
    mode: "major",
    tokens: ["I", "IV", "V"],
    tags: ["major", "rock", "blues", "driving", "simple"],
    description:
      "The three-chord backbone of rock and roll and blues. Nothing fancy — just simple, driving momentum that works in almost any tempo.",
  },
  {
    id: "doo-wop",
    name: "'50s / Doo-Wop",
    mode: "major",
    tokens: ["I", "vi", "IV", "V"],
    tags: ["major", "nostalgic", "sweet", "retro"],
    description:
      "The classic '50s progression behind countless doo-wop and early rock ballads. Warm, sentimental, and a little nostalgic no matter the tempo.",
  },
  {
    id: "jazz-turnaround",
    name: "Jazz Turnaround",
    mode: "major",
    tokens: ["ii", "V", "I"],
    tags: ["major", "jazz", "sophisticated", "resolving"],
    description:
      "The core cadence of jazz harmony. Smooth, purposeful motion that resolves home with real satisfaction — try it with 7th chords for the full effect.",
  },
  {
    id: "bittersweet-pop",
    name: "Bittersweet Pop",
    mode: "major",
    tokens: ["I", "IV", "vi", "V"],
    tags: ["major", "pop", "bittersweet"],
    description:
      "A close cousin of the pop staples that leans wistful before resolving to the dominant — great for a verse that needs a little ache in it.",
  },
  {
    id: "canon-pop",
    name: "Extended Pop (Canon-style)",
    mode: "major",
    tokens: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    tags: ["major", "pop", "cinematic", "uplifting"],
    description:
      "An eight-chord loop descended from Pachelbel's Canon — grand, cinematic, and endlessly satisfying to loop under a melody.",
  },
  {
    id: "mixolydian-rock",
    name: "Mixolydian Rock",
    mode: "major",
    tokens: ["I", "bVII", "IV"],
    tags: ["major", "rock", "anthemic", "gritty"],
    description:
      "Borrowing the flat-seven chord from outside the key gives this an anthemic, slightly rebellious classic-rock edge.",
  },
  {
    id: "retro-pop",
    name: "Retro Pop",
    mode: "major",
    tokens: ["I", "iii", "IV", "V"],
    tags: ["major", "pop", "retro", "sweet"],
    description:
      "A gentler, more old-fashioned pop loop — the iii chord adds a touch of wistfulness on the way to the four and five.",
  },
  {
    id: "fifths-descent",
    name: "Circle of Fifths",
    mode: "major",
    tokens: ["vi", "ii", "V", "I"],
    tags: ["major", "jazz", "pop", "resolving"],
    description:
      "Each chord's root falls a fifth into the next, a motion that feels inevitable and settled — a favorite in both jazz standards and pop choruses.",
  },
  {
    id: "minor-moody",
    name: "Natural Minor / Moody",
    mode: "minor",
    tokens: ["i", "iv", "v"],
    tags: ["minor", "dark", "moody", "rock"],
    description:
      "All-minor triads with no raised leading tone — dark, unresolved, and a little brooding. Common in rock and film scoring for tension that never fully releases.",
  },
  {
    id: "minor-epic",
    name: "Minor Pop / Rock (Epic)",
    mode: "minor",
    tokens: ["i", "VI", "III", "VII"],
    tags: ["minor", "epic", "dramatic", "pop", "rock"],
    description:
      "One of the most popular minor-key progressions in modern pop and rock — sweeping, dramatic, and built to carry a big chorus.",
  },
  {
    id: "andalusian",
    name: "Andalusian Cadence",
    mode: "minor",
    tokens: ["i", "VII", "VI", "V"],
    tags: ["minor", "dramatic", "flamenco", "cinematic"],
    description:
      "A descending bass line famous in flamenco and dramatic balladry. Tense and cinematic, like the harmony itself is falling.",
  },
  {
    id: "harmonic-cadence",
    name: "Harmonic Minor Cadence",
    mode: "minor",
    tokens: ["i", "iv", "V"],
    tags: ["minor", "classical", "tense", "resolving"],
    description:
      "Raising the third of the V chord (a major chord instead of the 'plain' minor v) creates real classical pull back to the tonic — tense, then resolved.",
  },
  {
    id: "minor-anthem",
    name: "Minor Anthem",
    mode: "minor",
    tokens: ["i", "VI", "VII"],
    tags: ["minor", "epic", "uplifting", "rock", "pop"],
    description:
      "A rising, anthemic minor loop — common in rock and pop-punk choruses that want minor-key intensity without losing momentum.",
  },
  {
    id: "minor-jazz",
    name: "Minor Jazz Turnaround",
    mode: "minor",
    tokens: ["ii°", "V", "i"],
    tags: ["minor", "jazz", "resolving", "sophisticated"],
    description:
      "The minor-key answer to ii-V-I — a half-diminished ii chord leans hard into the dominant before resolving home.",
  },
];

/** Every tag in use, deduped and sorted — what the filter UI builds itself from. */
export const PROGRESSION_TAGS: readonly string[] = [
  ...new Set(PROGRESSIONS.flatMap((p) => p.tags)),
].sort();
