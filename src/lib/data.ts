import { prisma } from '@/lib/prisma';

export async function getQuestion(id: string) {
    return await prisma.question.findUnique({
        where: { id },
        include: { testCases: true, attachments: true }
    });
}

export async function getNextQuestionId(currentId: string) {
    const currentQuestion = await prisma.question.findUnique({
        where: { id: currentId },
        select: { createdAt: true, id: true }
    });

    if (!currentQuestion) return null;

    // Find next question: (createdAt > current) OR (createdAt == current AND id > current)
    // This ensures deterministic order even with identical timestamps
    const nextQuestion = await prisma.question.findFirst({
        where: {
            OR: [
                { createdAt: { gt: currentQuestion.createdAt } },
                {
                    createdAt: currentQuestion.createdAt,
                    id: { gt: currentQuestion.id }
                }
            ]
        },
        orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' }
        ],
        select: { id: true }
    });

    if (nextQuestion) return nextQuestion.id;

    // Wrap around logic (optional) - User asked for "Last Question" state implicitly by "Next button missing". 
    // If we want wrapping, we return first. If we want "Last", return null.
    // User complaint "Next button is also not coming up" implies they expect one.
    // Let's NOT wrap around to make "Last Question" clear, unless requested.
    return null;
}

export async function getQuestionIndex(id: string) {
    // Get total count
    const total = await prisma.question.count();

    // Get position
    const currentQuestion = await prisma.question.findUnique({
        where: { id },
        select: { createdAt: true, id: true }
    });

    if (!currentQuestion) return { index: 0, total };

    // Count how many are strictly before this one
    const countBefore = await prisma.question.count({
        where: {
            OR: [
                { createdAt: { lt: currentQuestion.createdAt } },
                {
                    createdAt: currentQuestion.createdAt,
                    id: { lt: currentQuestion.id }
                }
            ]
        }
    });

    return { index: countBefore + 1, total };
}
