import { SITE } from "./constants";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sibi Kabilan",
    url: SITE.url,
    jobTitle: "AI Architect & Entrepreneur",
    description: SITE.description,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Oregon State University",
    },
    knowsAbout: [
      "Artificial Intelligence",
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "Enterprise Software Architecture",
    ],
    sameAs: [SITE.links.linkedin, SITE.links.github].filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    author: {
      "@type": "Person",
      name: "Sibi Kabilan",
    },
  };
}

export function organizationSchema(org: {
  name: string;
  url?: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: org.url,
    description: org.description,
    founder: {
      "@type": "Person",
      name: "Sibi Kabilan",
    },
  };
}

export function blogPostSchema(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${SITE.url}/blog/${post.slug}`,
    image: post.image || SITE.ogImage,
    author: {
      "@type": "Person",
      name: "Sibi Kabilan",
      url: SITE.url,
    },
  };
}
