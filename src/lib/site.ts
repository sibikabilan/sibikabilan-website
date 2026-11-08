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

export interface ReelFrame {
  years: string;
  role: string;
  place: string;
  story: string;
  lesson: string;
  image: string;
  alt: string;
}

export const REEL: ReelFrame[] = [
  {
    years: "2013 to 2017",
    role: "Software Developer",
    place: "Oregon State University · Corvallis",
    story:
      "Studied computer science and shipped my first production software, for the Oregon Department of Transportation's Transportation Operations Center. Moved a desktop system to the web and kept both alive for the operators who depended on them.",
    lesson: "Software people rely on doesn't get a maintenance window from reality.",
    image: "/media/era-2013.webp",
    alt: "A dark operations center with a wall of traffic camera monitors",
  },
  {
    years: "2017 to 2018",
    role: "AI Software Architect",
    place: "Independent",
    story:
      "Five clients, two of them in the Fortune 500, across twelve projects in machine learning, content distribution and data analytics.",
    lesson: "Design for the person who runs it after you leave.",
    image: "/media/era-2017.webp",
    alt: "System architecture diagrams drawn on a glass wall above a city at dusk",
  },
  {
    years: "2018 to 2021",
    role: "Co founder & CEO",
    place: "KayaDev AI · Bengaluru",
    story:
      "My first company. Computer vision and analytics products for enterprise teams, including Fortune 500s. I owned the whole stack of a startup: product, architecture, sales and the business.",
    lesson: "Nobody buys AI. They buy outcomes they can trust in production.",
    image: "/media/era-2018.webp",
    alt: "A street scene projected on a wall with computer vision tracking boxes",
  },
  {
    years: "2022 to 2024",
    role: "Product Owner, Risk and AI",
    place: "Servify · India and North America",
    story:
      "Owned device protection programs for Samsung Care+, AppleCare+ and Vivo V Shield. Built the engine that catches transactional risk and fraud, and brought generative AI into production through chatbots, IVRs and voicebots.",
    lesson: "Decide what it must never do before deciding what it should do.",
    image: "/media/era-2022.webp",
    alt: "Rows of glowing phones beneath streams of light like transactions",
  },
  {
    years: "2025 to now",
    role: "Founder",
    place: "SuprAgent · Bengaluru",
    story:
      "Founder again. Building an agent that talks to customers for banks, lenders, insurers and wealth firms, with my co founder Nandini Muthuraman and the team at Biome.",
    lesson: "I write the agent's code, and I answer for what it does.",
    image: "/media/era-2025.webp",
    alt: "A ribbon of light flowing from a chat bubble through a voice wave into a phone",
  },
];

export const PRINCIPLES = [
  { title: "Production first.", body: "The demo comes second. If it only works on stage, it doesn't work." },
  { title: "Build for the person on the other end.", body: "The operator, the customer, the team. Not the architecture diagram." },
  { title: "Agree the baseline first.", body: "Decide how you'll know it worked before you ship it, then show the number either way." },
];
