export interface Gallery {
  id: number;
  title: string;

  description?: string;
  imageUrl: string;

  published: boolean;

  createdAt?: string;
}
