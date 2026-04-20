export interface Venture {
  name: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  url?: string;
  status: "active" | "past";
}

export const ventures: Venture[] = [
  {
    name: "SuprAgent",
    role: "Co-founder",
    period: "Present",
    description:
      "Agentic UI platform that orchestrates customer journeys for financial services with intelligent, adaptive flows. Purpose-built for banking, fintechs, and insurtechs.",
    highlights: [
      "Dynamic UI generation that adapts in real-time",
      "Automated compliance enforcement with audit trails",
      "Serving banking, fintech, and insurtech sectors",
    ],
    url: "https://www.supragent.ai",
    status: "active",
  },
  {
    name: "KayaDev AI",
    role: "Co-founder & CEO",
    period: "2018 — 2022",
    description:
      "Built next-gen analytics products for Fortune 500 companies using deep learning and content distribution technologies. Helped enterprises leverage cutting-edge AI to build better applications faster.",
    highlights: [
      "Deep learning-powered analytics for Fortune 500s",
      "Content distribution technology platform",
      "AI consulting for enterprise applications",
    ],
    url: "https://kayadev.com",
    status: "past",
  },
];
