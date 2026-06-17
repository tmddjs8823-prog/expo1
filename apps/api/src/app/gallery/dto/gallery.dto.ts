export class CreateGalleryDto {
    title: string;
    titleEn?: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    published?: boolean;
    sortOrder?: number;
}

export class UpdateGalleryDto {
    title?: string;
    titleEn?: string;
    description?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    published?: boolean;
    sortOrder?: number;
}
