import { ExhibitionStatus } from '@prisma/client';

export class CreateExhibitionDto {
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  status?: ExhibitionStatus;
  published?: boolean;
}

export class UpdateExhibitionDto {
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  status?: ExhibitionStatus;
  published?: boolean;
}
