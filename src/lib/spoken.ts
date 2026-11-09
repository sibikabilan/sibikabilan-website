/**
 * The line the portrait says, in Sibi's own voice, word by word, with the
 * moment (seconds into the clip) each word starts. Timed to the clip's audio.
 */
export const SPOKEN_LINE = [
  { word: "Builder", at: 0.69 },
  { word: "by", at: 1.2 },
  { word: "trade.", at: 1.52 },
  { word: "Storyteller", at: 2.76 },
  { word: "by", at: 4.04 },
  { word: "habit.", at: 4.3 },
] as const;

/** When the last word has been said and the line can rest. */
export const SPOKEN_END = 4.85;

/** Whether the talking clip carries the voice track. Shows the sound toggle when true. */
export const SPOKEN_HAS_VOICE = true;
