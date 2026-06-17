export class PreregistrationDto {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    agreeTerms: boolean;
    agreeMarketing?: boolean;
}
