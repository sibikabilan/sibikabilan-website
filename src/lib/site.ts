/**
 * Static profile content. Editable copy (hero lines, bio, Now list, links,
 * toggles) lives in the CMS settings; the long story below changes rarely.
 */

export const SITE = {
  name: "Sibi Kabilan",
  /** The home page title: kept within about 60 characters so search results show it whole. */
  title: "Sibi Kabilan · Co founder of SuprAgent, engineer and writer",
  /** The home page snippet: about 150 characters. */
  description:
    "Sibi Kabilan is an entrepreneur, engineer and writer in Bengaluru, India. He co founded SuprAgent to build Agentic UI, and writes essays and fiction.",
  url: "https://www.sibikabilan.com",
  domain: "sibikabilan.com",
  locale: "en_US",
  keywords: [
    "Sibi Kabilan",
    "SuprAgent",
    "Agentic UI",
    "AI agents",
    "entrepreneur",
    "software engineer",
    "writer",
    "essays",
    "fiction",
    "Bengaluru",
    "KayaDev AI",
    "Oregon State University",
  ],
} as const;

/** The prologue: a personal credo, read as you scroll. */
export const PROLOGUE = [
  { line: "Every system I've built has had someone on the other end of it." },
  { line: "An operator watching the highways on a wall of screens." },
  { line: "A customer stuck on a form they don't quite understand." },
  { line: "A team betting their quarter on something that has to work." },
  { line: "I've learned to build for that person first." },
  { line: "Some of their stories I tell in code. The rest, I write down." },
];

export const FACETS = [
  {
    n: "01",
    verb: "Build",
    title: "Companies",
    body:
      "Two so far. KayaDev AI brought computer vision to enterprise teams, and I ran it as CEO for three years. SuprAgent is the second, and a bet on Agentic UI: interfaces an agent composes for each person, in the moment.",
    image: "/media/era-2025.webp",
    href: "#now",
    cta: "What I'm building",
  },
  {
    n: "02",
    verb: "Engineer",
    title: "Systems that hold up",
    body:
      "I still write the code. Risk engines, voice agents, interfaces that compose themselves. Production first, the demo second, and I answer for what ships.",
    image: "/media/era-2017.webp",
    href: "#story",
    cta: "The long way here",
  },
  {
    n: "03",
    verb: "Write",
    title: "Essays and fiction",
    body:
      "Notes from the build, and stories that have nothing to do with it. Published here, the essays when they're ready and the fiction a chapter at a time.",
    image: "/media/desk.webp",
    href: "/fiction",
    cta: "Open the library",
  },
];

export const NOW_WORK = {
  name: "SuprAgent",
  line: "Agentic UI: an interface an agent composes for one person at a time.",
  body:
    "A static screen is a guess about what the average customer needs, frozen at design time. In an Agentic UI the screen is an output of reasoning. The agent observes what this person is trying to do, decides the next step, acts through the product's own components, and learns from every journey that finished and every one that didn't.",
  verbs: [
    { verb: "Observe", text: "Reads what it's allowed to read: what was said, tapped, and already known." },
    { verb: "Decide", text: "Picks the next step against a goal and the rules your team wrote." },
    { verb: "Act", text: "Renders it with your own components, fills what it knows, calls your systems." },
    { verb: "Learn", text: "Every finished or abandoned journey makes the next one shorter." },
  ],
  not: "Not a chatbot in the corner. Not a copilot that suggests while the customer still does the work.",
  with: "Built with my co founder Nandini Muthuraman and the team at Biome.",
  essay: { title: "Why I'm betting my second company on Agentic UI", href: "/blog/betting-my-second-company-on-agentic-ui" },
};

export interface ReelLogo {
  src?: string;
  label: string;
  /** Keep the logo's own colours instead of the white treatment. */
  color?: boolean;
  /** Set the label in type instead of an image (no official file exists). */
  wordmark?: boolean;
}

/** What sits centre stage in an era: its marks, or a statement set large over the picture. */
export type ReelLockup =
  | { kind: "logos"; credit: string; logos: ReelLogo[] }
  | { kind: "statement"; credit: string; lines: string[] };

export interface ReelFrame {
  key: string;
  years: string;
  place: string;
  title: string;
  body: string;
  line: string;
  /** Background picture; omitted where the mark itself is the picture. */
  image?: string;
  alt?: string;
  lockup: ReelLockup;
  /** A second, smaller row of marks under the title card. */
  partners?: { credit: string; logos: ReelLogo[] };
}

/** Newest first: where I am, then the long way back to where I started. */
export const REEL: ReelFrame[] = [
  {
    key: "supragent",
    years: "2025 to now",
    place: "Bengaluru",
    title: "The bet on Agentic UI.",
    body:
      "A static screen is a guess about what the average customer needs, frozen at design time. SuprAgent bets on the opposite: an agent that reads the person in front of it, composes the next step from the product's own components, and works inside rules the institution writes. Built with my co founder Nandini Muthuraman and the team at Biome.",
    line: "I write the agent's code, and I answer for what it does.",
    lockup: { kind: "logos", credit: "What I'm building now", logos: [{ src: "/logos/supragent.webp", label: "SuprAgent", color: true }] },
  },
  {
    key: "servify",
    years: "2022 to 2024",
    place: "Servify · India and North America",
    title: "Real money, real people.",
    body:
      "I looked after device protection for Samsung and Apple customers, built the system that watched for fraud, and put generative AI in front of customers through chat, IVR and voice. When it's someone's phone and someone's money, there is no small mistake.",
    line: "Decide what it must never do before what it should do.",
    image: "/media/era-2022.webp",
    alt: "Rows of glowing phones beneath streams of light like transactions",
    lockup: {
      kind: "logos",
      credit: "Looking after customers of",
      logos: [
        { src: "/logos/samsung-care-plus.webp", label: "Samsung Care+", color: true },
        { src: "/logos/applecare-plus.webp", label: "AppleCare+", color: true },
      ],
    },
  },
  {
    key: "kayadev",
    years: "2018 to 2021",
    place: "Bengaluru",
    title: "The first company.",
    body:
      "KayaDev AI taught cameras to understand what they were seeing, for enterprise teams who needed it to work on a Monday morning, not in a demo. Three years as CEO taught me the difference between a model and a product.",
    line: "Nobody buys AI. They buy an outcome they can trust.",
    image: "/media/era-2018.webp",
    alt: "A street scene projected on a wall with computer vision tracking boxes",
    lockup: { kind: "logos", credit: "My first company", logos: [{ src: "/logos/kayadev.webp", label: "KayaDev AI", color: true }] },
  },
  {
    key: "architect",
    years: "2017 to 2018",
    place: "Independent",
    title: "Drawing systems for other people to run.",
    body:
      "Solution architecture across machine learning, content distribution and analytics. I started judging a design by how quiet things were after I handed it over.",
    line: "Design for whoever is on call when you're gone.",
    image: "/media/era-2017.webp",
    alt: "System diagrams on a glass wall above a city at dusk",
    lockup: { kind: "statement", credit: "On my own", lines: ["Five clients.", "Two in the Fortune 500.", "Twelve systems."] },
  },
  {
    key: "osu",
    years: "2013 to 2017",
    place: "Corvallis, Oregon",
    title: "Where I learned to build.",
    body:
      "My story began at Oregon State. It gave me a campus and, unusually early, real users: traffic operations software for the state of Oregon, and projects for the USDA, the California Board of Education and HP. Operators, analysts, civil servants: people who just needed the thing to work.",
    line: "Software people rely on doesn't get a maintenance window.",
    image: "/media/era-osu.webp",
    alt: "A silhouette on the lawn in front of the Memorial Union at Oregon State University",
    lockup: { kind: "logos", credit: "Where my story began", logos: [{ src: "/logos/oregon-state.svg", label: "Oregon State University" }] },
    partners: {
      credit: "My first real users",
      logos: [
        { src: "/logos/odot.svg", label: "Oregon Department of Transportation" },
        { src: "/logos/usda.svg", label: "USDA" },
        { label: "California Board of Education", wordmark: true },
        { src: "/logos/hp.svg", label: "HP" },
      ],
    },
  },
];

export const PRINCIPLES = [
  { title: "Production first.", body: "The demo comes second. If it only works on stage, it doesn't work." },
  { title: "Build for the person on the other end.", body: "The operator, the customer, the team. Not the architecture diagram." },
  { title: "Agree the baseline first.", body: "Decide how you'll know it worked before you ship it, then show the number either way." },
];
