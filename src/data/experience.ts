export interface Client {
  name: string;
  logo: string;
  context?: string;
}

export const clients: Client[] = [
  { name: "Apple Care+", logo: "/images/logos/apple.png" },
  { name: "Samsung Care+", logo: "/images/logos/samsung.png" },
  { name: "Vivo VShield", logo: "/images/logos/vivo.png" },
  { name: "Aditya Birla", logo: "/images/logos/aditya-birla.jpg" },
  { name: "Titan", logo: "/images/logos/titan.png" },
  { name: "Tata", logo: "/images/logos/tata.png" },
  { name: "Quess", logo: "/images/logos/quess.png" },
  { name: "USDA", logo: "/images/logos/usda.png" },
  { name: "Oregon DOT", logo: "/images/logos/oregon-dot.png", context: "Oregon Department of Transportation" },
  { name: "California BOE", logo: "/images/logos/california-boe.png", context: "California Board of Education" },
];
