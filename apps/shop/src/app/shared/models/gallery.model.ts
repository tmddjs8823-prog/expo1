export interface Gallery {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  published: boolean;
  sortOrder?: number;
  createdAt?: string;
}
