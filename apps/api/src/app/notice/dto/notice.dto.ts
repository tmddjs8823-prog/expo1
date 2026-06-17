export class CreateNoticeDto {
    title: string;
    content: string;
    published?: boolean;
    sortOrder?: number;
}

export class UpdateNoticeDto {
    title?: string;
    content?: string;
    published?: boolean;
    sortOrder?: number;
}