import { notFound } from 'next/navigation';
import { getQuestion, getNextQuestionId, getQuestionIndex } from '@/lib/data';
import { QuestionWorkspace } from '@/components/QuestionWorkspace';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function QuestionPage({ params }: PageProps) {
    const { id } = await params;
    const question = await getQuestion(id);
    const nextQuestionId = await getNextQuestionId(id);
    const { index, total } = await getQuestionIndex(id);

    if (!question) {
        notFound();
    }

    // Parse tags if string
    let tags: string[] = [];
    try {
        tags = JSON.parse(question.tags || '[]');
    } catch (e) {
        tags = [];
    }

    return (
        <QuestionWorkspace
            question={question}
            tags={tags}
            nextQuestionId={nextQuestionId || null}
            questionIndex={index}
            totalQuestions={total}
        />
    );
}
