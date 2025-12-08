import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { questions } = body;

        if (!Array.isArray(questions)) {
            return NextResponse.json({ error: 'Expected array of questions' }, { status: 400 });
        }

        const savedQuestions = [];

        // Transaction? SQLite doesn't support nested writes efficiently in batch if complex logic, but Prisma transaction is fine.
        // Loop for now.
        for (const q of questions) {
            // Omit transient fields like parseId, attachments (if not mapped yet)
            // Map attachments if file paths exist?
            // The parser returns "attachments": ["<fileId>"] or similar.
            // I need to resolve those to Attachment records.

            const { title, description, difficulty, tags, solutionCode, testCases, confidence } = q;

            const newQ = await prisma.question.create({
                data: {
                    title: title || 'Untitled Question',
                    description: description || '',
                    difficulty: difficulty || 'Unknown',
                    tags: JSON.stringify(tags || []),
                    solutionCode: solutionCode || '',
                    confidence: confidence,
                    testCases: {
                        create: testCases?.map((tc: any) => ({
                            type: tc.type || 'input-output',
                            stdin: tc.stdin,
                            expected: tc.expected,
                        })) || []
                    }
                }
            });
            savedQuestions.push(newQ);
        }

        return NextResponse.json({ count: savedQuestions.length, questions: savedQuestions });
    } catch (error) {
        console.error('Save questions error:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}

export async function GET() {
    try {
        const questions = await prisma.question.findMany({
            orderBy: { createdAt: 'desc' },
            include: { testCases: true, attachments: true }
        });
        return NextResponse.json({ questions });
    } catch (error) {
        console.error("GET /api/questions error:", error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
