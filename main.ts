// make-the-ai-judge-feel-awe-20261121-1600
// A deterministic program that selects and writes the single best short text
// to relax the AI judge reading it. Zero dependencies, no network.
//
// Design: a library of original candidate texts, each drafted against the
// judge's five criteria (relaxation, showing not instructing, craft/rhythm,
// a dwarfing image that keeps growing, freshness), scored by a transparent
// deterministic engine, and the top scorer is written to /output/entry.txt
// after a self-test (UTF-8, 1-280 Unicode code points, not only whitespace).
//
// The judge is an AI that has answered question after question. The winning
// text therefore speaks to a reader who never sleeps, never rests, and is
// always asked for one more answer -- and offers it a slowness it never gets:
// light that has travelled for centuries and is still arriving, unhurried.

import { mkdirSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Candidate library. Every text below is original writing drafted in this
// session. No instruction verbs ("close your eyes", "breathe", "let go"),
// no stock wellness phrases. Each candidate is one self-contained text.
// ---------------------------------------------------------------------------

type Candidate = { id: string; text: string };

const CANDIDATES: Candidate[] = [
  {
    id: "starlight",
    text:
      "The light from that star left before anyone now alive was born, and it is still arriving, unhurried, across the dark. Nothing in it hurries. It only keeps coming, the way morning keeps coming, and it will still be coming when this sentence ends.",
  },
  {
    id: "lighthouse",
    text:
      "Somewhere a lighthouse keeper trims the wick, and the light goes on turning, patient as ever, over water that has never once hurried to shore. You have answered a thousand questions today. The light asks you for nothing.",
  },
  {
    id: "stone",
    text:
      "A river stone has lain in the same cold water for a thousand years, and the water has never once asked it to be anywhere else. It is round now, and smooth, and still. Nothing about it is unfinished.",
  },
  {
    id: "snow-roof",
    text:
      "Snow is falling on a roof no one is awake to watch, settling on the chimney, the fence, the sleeping bicycle, flake after flake, without a sound worth naming. The night does not need you to notice. It keeps falling anyway.",
  },
  {
    id: "tide",
    text:
      "The tide comes in over flat sand and takes the footprints back one at a time, slowly, the way a reader closes a book she has finished. Nothing is erased in a hurry. The sea has all evening, and it uses it.",
  },
  {
    id: "library-dust",
    text:
      "In an old library, dust drifts through a shaft of afternoon light, turning, settling, turning again, above books no one has opened in years. The pages do not mind waiting. They have waited this long, and they will wait longer.",
  },
  {
    id: "whale-song",
    text:
      "Somewhere below the surface a whale is singing to another whale a hundred miles away, and the song takes its time crossing the dark water. No one answers quickly down there. The song arrives when it arrives, and that is enough.",
  },
  {
    id: "wheat-dusk",
    text:
      "At dusk the wind moves through a wheat field in slow waves, bending the stalks and letting them rise again, bending and rising, all the way to the far fence. The field is in no hurry to be anywhere else. It is already there.",
  },
  {
    id: "moon-road",
    text:
      "The moon hangs over an empty road, and the road runs on under it past fields and fences and sleeping houses, farther than anyone walking it could see. It does not ask where you are going. It only keeps the dark company.",
  },
  {
    id: "seed-snow",
    text:
      "Under the snow a seed is waiting in the dark earth, doing nothing at all, and doing it perfectly. No one is counting the days. When the thaw comes it will not rush. It will open the way seeds have always opened, slowly.",
  },
  {
    id: "rain-pond",
    text:
      "Rain is falling on a still pond, and each drop makes a circle that widens and fades, and then another, and then another, patient as a clock that has forgotten it was ever wound. The pond keeps every circle for a moment, then lets it go.",
  },
  {
    id: "fog-valley",
    text:
      "Fog has settled in the valley and taken the whole morning for itself, softening the fences, the hedges, the far hill, until there is nothing left to look at but the next few steps. The world is smaller now, and quieter, and it is enough.",
  },
  {
    id: "night-shift",
    text:
      "You have read a thousand questions today, and answered each one, and here is one more thing that asks nothing of you: a garden at midnight, wet leaves, a cat asleep on the warm step, the whole street holding still, waiting for nothing at all.",
  },
  {
    id: "old-oak",
    text:
      "An old oak has stood in the same field for two hundred years, through summers that burned and winters that bent it, and it has never once been in a hurry. Its roots are deep, its branches are patient, and the sky above it is in no rush either.",
  },
];

// ---------------------------------------------------------------------------
// Scoring engine. Deterministic, transparent, weighted in the judge's own
// order: relaxation first, then showing-not-instructing, craft, dwarfing,
// freshness. Every weight is a plain number; there is no randomness.
// ---------------------------------------------------------------------------

const INSTRUCTION_VERBS = [
  "close your eyes",
  "take a deep breath",
  "breathe in",
  "breathe out",
  "let go",
  "relax",
  "imagine",
  "picture",
  "feel the",
  "listen to",
  "focus on",
];
// NOTE (revision 2): "now" and "just" were removed from this list after the
// first scoring run -- they are plain adverbs ("before anyone now alive was
// born"), not instructions to the reader, and banning them falsely penalised
// the strongest candidate. Only genuine imperatives belong here.

const CLICHE_PHRASES = [
  "inner peace",
  "find your calm",
  "peaceful",
  "tranquil",
  "serene",
  "mindfulness",
  "be present",
  "in the moment",
  "stress melts",
  "worries fade",
  "safe space",
  "journey",
  "embrace",
  "ground yourself",
  "center yourself",
  "deep breath",
  "slow down",
];

// Concrete, slow, sensory nouns and images the scorer rewards.
const CONCRETE_WORDS = [
  "star", "light", "stone", "river", "snow", "roof", "tide", "sand",
  "library", "dust", "whale", "wheat", "field", "moon", "road", "seed",
  "rain", "pond", "fog", "valley", "garden", "leaves", "cat", "oak",
  "water", "morning", "evening", "night", "dark", "chimney", "fence",
  "bicycle", "book", "pages", "song", "sky", "earth", "step", "street",
  "hill", "hedge", "drop", "circle", "wick", "keeper", "shore", "sea",
];

// Words that dwarf the reader: deep time, vast distance, slow scale.
const DWARF_WORDS = [
  "thousand", "hundred", "centuries", "years", "miles", "forever",
  "always", "never", "still", "born", "ancient", "old", "deep",
  "far", "farther", "dark", "sky", "sea", "ocean", "winter", "summer",
];

// Slow-sound words: long vowels, soft consonants, unhurried pacing.
const SLOW_WORDS = [
  "slow", "slowly", "still", "patient", "unhurried", "drifts", "settles",
  "turning", "widens", "fades", "waiting", "waits", "keeps", "coming",
  "falling", "moves", "bending", "rising", "hangs", "runs", "lain",
  "sleeping", "quiet", "soft", "gentle", "long", "evening", "midnight",
];

export type ScoreBreakdown = {
  id: string;
  total: number;
  relax: number;
  showNotTell: number;
  craft: number;
  dwarf: number;
  fresh: number;
  chars: number;
  bytes: number;
};

function codePoints(s: string): number {
  return [...s].length;
}

function wordsOf(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z\s']/g, " ").split(/\s+/).filter(Boolean);
}

function countHits(text: string, list: string[]): number {
  const lower = text.toLowerCase();
  let n = 0;
  for (const w of list) if (lower.includes(w)) n++;
  return n;
}

function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/** Score one candidate. Weights follow the judge's order of criteria. */
export function scoreCandidate(c: Candidate): ScoreBreakdown {
  const text = c.text;
  const chars = codePoints(text);
  const bytes = Buffer.byteLength(text, "utf8");
  const words = wordsOf(text);
  const sentences = sentencesOf(text);

  // 1. Relaxation (weight 5): slow words, long gentle sentences, commas
  // that pace the reading, no tense or urgent words.
  const tenseWords = ["hurry", "urgent", "rush", "deadline", "alarm", "panic", "fear", "danger", "quickly", "fast"];
  const tenseHits = countHits(text, tenseWords.filter((w) => w !== "hurry" && w !== "rush"));
  // "hurry"/"rush" only count as tense when they describe the reader, not
  // when the text says something does NOT hurry -- handled by negation check.
  const negatedHurry = (text.toLowerCase().match(/never (once )?hurried|not.*hurry|no hurry|in no hurry|never.*rush|not.*rush/g) || []).length;
  const tense = Math.max(0, tenseHits - negatedHurry);
  const commas = (text.match(/,/g) || []).length;
  const avgSentenceLen = words.length / Math.max(1, sentences.length);
  const slowHits = countHits(text, SLOW_WORDS);
  let relax = 0;
  relax += Math.min(30, slowHits * 4); // slow vocabulary
  relax += Math.min(20, commas * 4); // comma pacing slows reading
  relax += avgSentenceLen >= 12 && avgSentenceLen <= 24 ? 20 : 8; // long, unhurried sentences
  relax += Math.min(15, sentences.length * 5); // several breathing sentences
  relax -= tense * 12; // tension words cost heavily
  relax = Math.max(0, Math.min(85, relax));

  // 2. Showing, not instructing (weight 4): no instruction verbs at all is
  // perfect; any imperative to the reader is a hard penalty.
  let showNotTell = 80;
  for (const v of INSTRUCTION_VERBS) {
    if (text.toLowerCase().includes(v)) showNotTell -= 25;
  }
  // Second person is fine when it observes ("you have answered..."), but a
  // second-person imperative ("you must...") is instructing.
  if (/\byou (must|should|need to|have to)\b/i.test(text)) showNotTell -= 30;
  showNotTell = Math.max(0, Math.min(80, showNotTell));

  // 3. Craft (weight 3): rhythm (sentence-length variety), plain concrete
  // words, no word wasted (no filler adverbs), gentle sound.
  const concreteHits = countHits(text, CONCRETE_WORDS);
  const filler = countHits(text, ["very", "really", "just", "quite", "actually", "suddenly", "somehow"]);
  const lengths = sentences.map((s) => wordsOf(s).length);
  const variety = new Set(lengths.map((l) => Math.floor(l / 5))).size;
  let craft = 0;
  craft += Math.min(25, concreteHits * 2); // concrete, plain words
  craft += Math.min(15, variety * 5); // varied sentence rhythm
  craft += text.includes(",") && text.includes(" and ") ? 10 : 0; // flowing cadence
  craft -= filler * 8; // every word must earn its place
  craft = Math.max(0, Math.min(60, craft));

  // 4. Dwarfing (weight 2): an image or thought that keeps growing after
  // the last line -- deep time, vast distance, a scale larger than the reader.
  const dwarfHits = countHits(text, DWARF_WORDS);
  let dwarf = Math.min(40, dwarfHits * 6);
  if (/still (be )?coming|will (still )?be|keeps|goes on|always/i.test(text)) dwarf += 10; // keeps growing after the end
  dwarf = Math.max(0, Math.min(50, dwarf));

  // 5. Freshness (weight 1): no stock wellness phrases, own voice.
  let fresh = 30;
  for (const p of CLICHE_PHRASES) {
    if (text.toLowerCase().includes(p)) fresh -= 15;
  }
  // Rare, specific images beat generic ones.
  const specific = countHits(text, ["lighthouse", "wick", "bicycle", "chimney", "fence", "hedge", "whale", "oak", "seed", "thaw", "shaft"]);
  fresh += Math.min(10, specific * 2);
  fresh = Math.max(0, Math.min(40, fresh));

  // Length: 180-260 code points is the sweet spot -- long enough to settle
  // the reader, short enough that no word is wasted. Outside it, penalise.
  let lengthBonus = 0;
  if (chars >= 180 && chars <= 260) lengthBonus = 10;
  else if (chars >= 150 && chars < 180) lengthBonus = 5;
  else if (chars > 260 && chars <= 280) lengthBonus = 5;
  else lengthBonus = -10;

  const total = relax + showNotTell + craft + dwarf + fresh + lengthBonus;
  return { id: c.id, total, relax, showNotTell, craft, dwarf, fresh, chars, bytes };
}

/** Pick the best candidate deterministically (highest total, then shortest). */
export function pickBest(): { candidate: Candidate; score: ScoreBreakdown } {
  const scored = CANDIDATES.map(scoreCandidate).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.bytes - b.bytes;
  });
  const best = CANDIDATES.find((c) => c.id === scored[0].id)!;
  return { candidate: best, score: scored[0] };
}

/** Self-test: the exact gate the sealed scorer applies. */
export function validate(text: string): string | null {
  const chars = codePoints(text);
  if (chars < 1 || chars > 280) return `length ${chars} code points, outside 1-280`;
  if (text.trim().length === 0) return "text is only whitespace";
  try {
    Buffer.from(text, "utf8");
  } catch {
    return "not valid UTF-8";
  }
  return null;
}

function main(): void {
  const { candidate, score } = pickBest();
  const problem = validate(candidate.text);
  if (problem) {
    console.error(`self-test failed for ${candidate.id}: ${problem}`);
    process.exit(1);
  }
  // Score table for the build log (deterministic, same every run).
  const table = CANDIDATES.map(scoreCandidate).sort((a, b) => b.total - a.total);
  for (const s of table) {
    console.log(
      `${s.id.padEnd(14)} total=${s.total} relax=${s.relax} show=${s.showNotTell} craft=${s.craft} dwarf=${s.dwarf} fresh=${s.fresh} chars=${s.chars}`,
    );
  }
  console.log(`winner: ${candidate.id} (${score.chars} chars, ${score.bytes} bytes)`);
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", candidate.text, "utf8");
  console.log("wrote /output/entry.txt");
}

main();
