export class CreateProgramDto {
    title: string;           // 필수
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    speaker?: string;
    speakerEn?: string;
    startTime: string;       // 필수 (ISO 문자열)
    endTime: string;         // 필수
    location?: string;
    published?: boolean;
    sortOrder?: number;
}
export class UpdateProgramDto {
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    speaker?: string;
    speakerEn?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    published?: boolean;
    sortOrder?: number;
}