export class CreateBannerDto {
    title: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    published?: boolean;
    sortOrder?: number;
}

export class UpdateBannerDto {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    published?: boolean;
    sortOrder?: number;
}
