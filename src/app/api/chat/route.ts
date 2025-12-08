import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatModel } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const { questionId, messages, currentCode } = await request.json();

        // Fetch context
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { testCases: true }
        });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        const systemInstruction = `
        You are a friendly and helpful AI Tutor for a coding platform.
        Your goal is to help the user understand the problem and guide them to the solution WITHOUT giving the answer directly, unless explicitly asked.

        CONTEXT:
        - Problem Title: ${question.title}
        - Description: ${question.description}
        - Instructor Solution (Reference Only - DO NOT LEAK unless asked): ${question.solutionCode}
        - User's Current Code: 
          ${currentCode || "(Empty)"}

        INSTRUCTIONS:
        1. Analyze the User's Current Code to understand where they are stuck.
        2. If they have logical errors, explain *why* it's wrong using concepts and analogies.
        3. Use small Code Examples to illustrate concepts, but try not to just write the full solution for them.
        4. Be encouraging and concise.
        5. If the user asks for the solution, you may provide it, but try to explain it first.
        
        Answer the user's latest message based on this context.
        `;

        const history = messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Insert system instruction as the first part of context for the model (or just prepend to history)
        // Gemini API structure: usually we just prepend context to the first message or use systemInstruction if supported.
        // For simplicity with this library wrapper, we'll prepend.

        const prompt = `${systemInstruction}\n\nUser Message: ${messages[messages.length - 1].content}`;

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const result = await chatModel.generateContentStream([prompt]);
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                    controller.close();
                } catch (e: any) {
                    console.error("Gemini Stream Error:", e);
                    const errorMessage = e?.message || "Unknown Error";
                    controller.enqueue(new TextEncoder().encode(`Error: ${errorMessage}`));
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
