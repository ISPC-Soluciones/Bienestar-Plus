export interface Noticia {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string | null;
  category: string;
}

export interface NoticiasResponse {
  articles: Noticia[];
  isFallback: boolean;
  updatedAt: string;
}
