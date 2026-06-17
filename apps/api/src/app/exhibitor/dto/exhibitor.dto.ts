export class CreateExhibitorDto {
  companyName: string;
  companyNameEn?: string;
  description?: string;
  boothNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  exhibitionId: number;
}

export class UpdateExhibitionDto {
  companyName?: string;
  companyNameEn?: string;
  description?: string;
  boothNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  exhibitionId: number;
}


