"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Tag, Code2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionListProps {
    onOpenUpload: () => void;
    onSelectQuestion: (q: any) => void;
    refreshKey: number;
}

export function QuestionList({ onOpenUpload, onSelectQuestion, refreshKey }: QuestionListProps) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, [refreshKey]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/questions');
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (e) {
            setError("Could not load questions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Question Bank</h1>
                    <p className="text-gray-400 mt-1">Manage and practice your JavaScript problems.</p>
                </div>

                <button
                    onClick={onOpenUpload}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5" />
                    Upload New
                </button>
            </div>

            {/* Filters (Mock) */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        placeholder="Search questions..."
                        className="w-full pl-9 pr-4 py-2 border border-zinc-700 rounded-lg bg-zinc-900 text-gray-200 focus:bg-zinc-800 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-gray-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading questions...</div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
            ) : questions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="bg-white px-4 py-3 rounded-full inline-block mb-3 shadow-sm border">❓</div>
                    <h3 className="font-semibold text-gray-900">No questions yet</h3>
                    <p className="text-gray-500 text-sm mt-1 mb-4">Upload a PDF or image to get started.</p>
                    <button onClick={onOpenUpload} className="text-blue-600 hover:underline text-sm font-medium">Upload questions</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questions.map(q => (
                        <div
                            key={q.id}
                            onClick={() => onSelectQuestion(q)}
                            className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 group cursor-pointer rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={cn("text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide",
                                    q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        q.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                )}>
                                    {q.difficulty}
                                </span>
                                {q.confidence < 0.8 && (
                                    <div className="text-amber-500" title="Low AI Confidence">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            <h3 className="font-semibold text-lg text-blue-400 mb-2 line-clamp-2">{q.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">{q.description}</p>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-zinc-800">
                                <div className="flex gap-1">
                                    {(JSON.parse(q.tags || '[]') as string[]).slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] bg-zinc-800 text-gray-400 px-2 py-1 rounded-md">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
