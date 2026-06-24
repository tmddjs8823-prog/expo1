export interface Exhibition {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  imageUrl?: string;
  linkUrl?: string;
  status: string;
  published?: boolean;
}
