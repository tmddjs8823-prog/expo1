export interface FaqCategory {
  id: number;
  name: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  published: boolean;
  categoryId: number;
  category?: FaqCategory;
  createdAt: string;
}
