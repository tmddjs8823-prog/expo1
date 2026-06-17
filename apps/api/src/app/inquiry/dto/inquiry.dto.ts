export class CreateInquiryDto {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    content: string;
}

export class AnswerInquiryDto {
    answer: string;
}
