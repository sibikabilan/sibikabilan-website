// Blog utility functions for use with Velite
// Once Velite is configured to build, import from ".velite" directly
// For now, these are placeholder types and utilities

export interface BlogPost {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  published: boolean;
  slug: string;
  slugAsParams: string;
  body: string;
  readingTime: number;
}

export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPublishedPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter((post) => post.published);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
