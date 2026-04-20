export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    name: "AI / ML",
    skills: [
      "Deep Learning",
      "Computer Vision",
      "NLP",
      "LLMs",
      "RAG Architectures",
      "MLOps",
    ],
  },
  {
    name: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "SQL", "Go"],
  },
  {
    name: "Frameworks",
    skills: ["Next.js", "React", "Node.js", "FastAPI", "PyTorch", "LangChain"],
  },
  {
    name: "Cloud & Infra",
    skills: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "Vercel"],
  },
  {
    name: "Data",
    skills: [
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Elasticsearch",
      "Vector DBs",
    ],
  },
  {
    name: "Tools & Practices",
    skills: ["Git", "CI/CD", "System Design", "Agile", "Product Strategy"],
  },
];
