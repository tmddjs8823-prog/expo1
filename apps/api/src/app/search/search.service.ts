import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) {}

    async search(query: string) {
        if (!query || query.trim().length === 0) {
            return { exhibitions: [], notices: [], faqs: [], programs: [], galleries: [] };
        }

        const q = query.trim();
        const contains = q;

        const [exhibitions, notices, faqs, programs, galleries] = await Promise.all([
            this.prisma.exhibition.findMany({
                where: {
                    published: true,
                    OR: [
                        { title: { contains, mode: 'insensitive' } },
                        { description: { contains, mode: 'insensitive' } },
                        { venue: { contains, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, title: true, description: true, imageUrl: true, startDate: true },
                orderBy: { updatedAt: 'desc' },
                take: 5,
            }),
            this.prisma.notice.findMany({
                where: {
                    published: true,
                    OR: [
                        { title: { contains, mode: 'insensitive' } },
                        { content: { contains, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, title: true, createdAt: true },
                orderBy: { updatedAt: 'desc' },
                take: 5,
            }),
            this.prisma.faq.findMany({
                where: {
                    published: true,
                    OR: [
                        { question: { contains, mode: 'insensitive' } },
                        { answer: { contains, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, question: true },
                orderBy: { updatedAt: 'desc' },
                take: 5,
            }),
            this.prisma.program.findMany({
                where: {
                    published: true,
                    OR: [
                        { title: { contains, mode: 'insensitive' } },
                        { speaker: { contains, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, title: true, speaker: true, startTime: true },
                orderBy: { updatedAt: 'desc' },
                take: 5,
            }),
            this.prisma.gallery.findMany({
                where: {
                    published: true,
                    OR: [
                        { title: { contains, mode: 'insensitive' } },
                        { description: { contains, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, title: true, imageUrl: true },
                orderBy: { updatedAt: 'desc' },
                take: 5,
            }),
        ]);

        return { exhibitions, notices, faqs, programs, galleries };
    }
}
