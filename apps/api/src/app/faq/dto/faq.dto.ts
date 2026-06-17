//FaqCategory
export class CreateFaqCategoryDto{
    name: string;
    sortOrder?: number;
}

export class UpdateFaqCategoryDto {
    name?: string;
    sortOrder?: number;
}

//Faq
export class CreateFaqDto {
    question : string ;
    questionEn? : string ;
    answer: string;
    answerEn?: string;
    published?: boolean;
    sortOrder?: number;
    categoryId: number;
}

export class UpdateFaqDto {
    question ?: string ;
    questionEn? : string ;
    answer?: string;
    answerEn?: string;
    published?: boolean;
    sortOrder?: number;
    categoryId?: number;
}

