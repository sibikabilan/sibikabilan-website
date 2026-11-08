/**
 * Static profile content. Editable copy (hero lines, bio, Now list, links,
 * toggles) lives in the CMS settings; the long story below changes rarely.
 */

export const SITE = {
  name: "Sibi Kabilan",
  title: "Sibi Kabilan · Entrepreneur, engineer, writer",
  description:
    "Sibi Kabilan is a two time founder and engineer building SuprAgent, and a writer of essays and fiction. Over a decade of shipping software people rely on, from Oregon to Bengaluru.",
  url: "https://www.sibikabilan.com",
} as const;

/** The prologue: a personal credo, played as subtitles over the threads scene. */
export const PROLOGUE = [
  { line: "Every system I've built has had someone on the other end of it.", note: "PROLOGUE" },
  { line: "An operator watching the highways on a wall of screens.", note: "SCENE 01 · THE OPERATOR" },
  { line: "A customer stuck on a form they don't quite understand.", note: "SCENE 02 · THE CUSTOMER" },
  { line: "A team betting their quarter on something that has to work.", note: "SCENE 03 · THE TEAM" },
  { line: "I've learned to build for that person first.", note: "SCENE 04 · THE LESSON" },
  { line: "Some of their stories I tell in code. The rest, I write down.", note: "SCENE 05 · THE OTHER HALF" },
];

export const FACETS = [
  {
    n: "01",
    verb: "Build",
    title: "Companies",
    body:
      "Two so far. KayaDev AI brought computer vision to enterprise teams, and I ran it as CEO for three years. SuprAgent is the second: an AI agent that sells for financial institutions.",
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
  line: "The AI agent that sells for banks, lenders, insurers and wealth firms.",
  body:
    "It does what your best relationship manager does, for every customer at once: it pitches, negotiates inside the limits the institution sets, collects the documents, takes the payment and closes. One continuous conversation across WhatsApp, a voice call in the customer's own language, and the app screen.",
  steps: ["Pitch", "Negotiate", "Collect", "Pay", "Close"],
  channels: ["WhatsApp", "Voice", "Agentic UI"],
  with: "Built with my co founder Nandini Muthuraman and the team at Biome.",
};

export interface ReelLogo {
  src?: string;
  label: string;
  /** Keep the logo's own colours instead of the white treatment. */
  color?: boolean;
  /** Set the label in type instead of an image. */
  wordmark?: boolean;
  /** Text after the mark, e.g. Samsung + "Care+". */
  suffix?: string;
}

export interface ReelCredit {
  label: string;
  logos: ReelLogo[];
  size: "lg" | "md";
}

export interface ReelFrame {
  years: string;
  place: string;
  title: string;
  body: string;
  line: string;
  image: string;
  alt: string;
  credits: ReelCredit[];
  overlay?: "blueprint";
}

const OSU: ReelLogo = { src: "/logos/oregon-state.svg", label: "Oregon State University" };

export const REEL: ReelFrame[] = [
  {
    years: "2013 to 2017",
    place: "Corvallis, Oregon",
    title: "Where I learned to build.",
    body:
      "Oregon State gave me a campus and, unusually early, real users. Traffic operations software for the state of Oregon, and projects for the USDA, the California Board of Education and HP. Operators, analysts, civil servants: people who just needed the thing to work.",
    line: "Software people rely on doesn't get a maintenance window.",
    image: "/media/era-osu.webp",
    alt: "A silhouette on the lawn in front of the Memorial Union at Oregon State University",
    credits: [
      { label: "Filmed at", size: "lg", logos: [OSU] },
      {
        label: "In association with",
        size: "md",
        logos: [
          { src: "/logos/odot.svg", label: "Oregon Department of Transportation" },
          { src: "/logos/usda.svg", label: "USDA" },
          { label: "California Board of Education", wordmark: true },
          { src: "/logos/hp.svg", label: "HP" },
        ],
      },
    ],
  },
  {
    years: "2017 to 2018",
    place: "Independent",
    title: "Drawing systems for other people to run.",
    body:
      "Two years as an independent architect across a dozen projects in machine learning, content distribution and analytics. I started judging a design by how quiet things were after I handed it over.",
    line: "Design for whoever is on call when you're gone.",
    image: "/media/era-2017.webp",
    alt: "System diagrams on a glass wall above a city at dusk",
    overlay: "blueprint",
    credits: [{ label: "An independent production", size: "lg", logos: [{ label: "Five clients · Twelve systems", wordmark: true }] }],
  },
  {
    years: "2018 to 2021",
    place: "Bengaluru",
    title: "The first company.",
    body:
      "KayaDev AI taught cameras to understand what they were seeing, for enterprise teams who needed it to work on a Monday morning, not in a demo. Three years as CEO taught me the difference between a model and a product.",
    line: "Nobody buys AI. They buy an outcome they can trust.",
    image: "/media/era-2018.webp",
    alt: "A street scene projected on a wall with computer vision tracking boxes",
    credits: [{ label: "A production of", size: "lg", logos: [{ label: "KayaDev AI", wordmark: true }] }],
  },
  {
    years: "2022 to 2024",
    place: "Servify · India and North America",
    title: "Real money, real people.",
    body:
      "I looked after device protection for Samsung and Apple customers, built the system that watched for fraud, and put generative AI in front of customers through chat, IVR and voice. When it's someone's phone and someone's money, there is no small mistake.",
    line: "Decide what it must never do before what it should do.",
    image: "/media/era-2022.webp",
    alt: "Rows of glowing phones beneath streams of light like transactions",
    credits: [
      {
        label: "Presented for",
        size: "lg",
        logos: [
          { src: "/logos/samsung.svg", label: "Samsung Care+", suffix: "Care+" },
          { src: "/logos/apple.svg", label: "AppleCare+", suffix: "AppleCare+" },
        ],
      },
    ],
  },
  {
    years: "2025 to now",
    place: "Bengaluru",
    title: "Founder, again.",
    body:
      "Everything above, pointed at one problem: the moment a customer goes quiet. An agent that talks to people the way your best person would, built with my co founder Nandini Muthuraman and the team at Biome.",
    line: "I write the agent's code, and I answer for what it does.",
    image: "/media/era-2025.webp",
    alt: "A ribbon of light flowing from a chat bubble through a voice wave into a phone",
    credits: [{ label: "A SuprAgent original", size: "lg", logos: [{ src: "/logos/supragent.webp", label: "SuprAgent", color: true }] }],
  },
];

export const PRINCIPLES = [
  { title: "Production first.", body: "The demo comes second. If it only works on stage, it doesn't work." },
  { title: "Build for the person on the other end.", body: "The operator, the customer, the team. Not the architecture diagram." },
  { title: "Agree the baseline first.", body: "Decide how you'll know it worked before you ship it, then show the number either way." },
];
