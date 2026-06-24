export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  published: boolean;
  sortOrder: number;
}
