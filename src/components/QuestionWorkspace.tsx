"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, Loader2, Send, ArrowRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeWorkspace } from './CodeWorkspace';
import { TestResults } from './TestResults';
import { ChatWindow } from './ChatWindow';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';

interface QuestionWorkspaceProps {
    question: any;
    tags: string[];
    nextQuestionId: string | null;
    questionIndex: number;
    totalQuestions: number;
}

export function QuestionWorkspace({ question, tags, nextQuestionId, questionIndex, totalQuestions }: QuestionWorkspaceProps) {
    const [code, setCode] = useState(
        question.starterCode ||
        "// Write your solution here\n// Hint: Check the problem statement for requirements\n\nconst solution = () => {\n  // Your code here\n};"
    );
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);
    const [view, setView] = useState<'code' | 'solution'>('code');
    const [rightPanel, setRightPanel] = useState<'preview' | 'chat'>('preview');
    const [showAnswer, setShowAnswer] = useState(false);

    // Force code reset when question changes
    // This fixes the issue where navigating to next question kept the previous code/solution
    const [currentQuestionId, setCurrentQuestionId] = useState(question.id);
    if (question.id !== currentQuestionId) {
        setCurrentQuestionId(question.id);
        setCode(question.starterCode || "// Write your solution here\n");
        setShowAnswer(false);
        setTestResults(null);
        setView('code');
        setRightPanel('preview');
    }

    const handleRun = async () => {
        setIsRunning(true);
        setTestResults(null);
        setRightPanel('preview'); // Switch to preview to show results
        try {
            const res = await fetch(`/api/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId: question.id, code })
            });
            const data = await res.json();
            setTestResults(data);

            // Auto-show answer if all passed
            if (data.summary && data.summary.failed === 0) {
                // Optional: ask user if they want to see it? Or just unlock it?
                // Let's keep it manual for now to avoid spoilers if they just want to verify.
                // setShowAnswer(true); 
            }
        } catch (e) {
            console.error(e);
            alert("Failed to run tests");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-black overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 border-b border-zinc-800 flex items-center px-6 justify-between bg-black shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="text-xs text-gray-500 font-medium mb-0.5">Problem {questionIndex} of {totalQuestions}</div>
                        <h1 className="font-bold text-xl truncate max-w-md text-gray-100">{question.title}</h1>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Debug: {nextQuestionId} */}
                    {nextQuestionId ? (
                        <Link href={`/questions/${nextQuestionId}`} className="bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 border border-zinc-700 transition-all">
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <span className="text-gray-600 text-xs flex items-center px-3">Last Question</span>
                    )}
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="bg-zinc-800 text-gray-200 hover:bg-zinc-700 px-5 py-2 rounded-lg font-medium flex items-center gap-2 border border-zinc-700 disabled:opacity-50 transition-all"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        Test
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all"
                    >
                        Submit
                    </button>
                </div>
            </header>

            {/* Main Layout - 3 Columns */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Column: Description (25%) */}
                <div className="w-[25%] min-w-[320px] border-r border-zinc-800 bg-black flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
                        <section className="mb-8">
                            <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Problem Statement</h2>
                            <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 max-w-none text-base leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        code({ className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '')
                                            const isInline = !match && !String(children).includes('\n');

                                            if (isInline) {
                                                return (
                                                    <code className="bg-zinc-800 text-gray-300 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }

                                            return (
                                                <div className="my-4 rounded-lg overflow-hidden border border-zinc-700 bg-[#1e1e1e] shadow-sm">
                                                    <div className="flex items-center px-4 py-2 bg-zinc-800/50 border-b border-zinc-700/50">
                                                        <div className="flex gap-1.5">
                                                            <div className="w-3 h-3 rounded-full bg-red-500/20 text-red-500/20" />
                                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 text-yellow-500/20" />
                                                            <div className="w-3 h-3 rounded-full bg-green-500/20 text-green-500/20" />
                                                        </div>
                                                        <span className="ml-3 text-xs text-gray-500 font-mono">{match ? match[1] : 'text'}</span>
                                                    </div>
                                                    <div className="p-4 overflow-x-auto">
                                                        <code className={cn(className, "block font-mono text-sm text-gray-300 whitespace-pre")} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }}
                                >
                                    {question.description}
                                </ReactMarkdown>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Examples</h3>
                                <div className="space-y-4">
                                    {question.testCases.map((tc: any, i: number) => (
                                        <div key={i} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-sm">
                                            <div className="grid gap-3">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Input</div>
                                                    <code className="block bg-zinc-950 text-gray-300 p-2 rounded border border-zinc-800 font-mono">
                                                        {tc.stdin}
                                                    </code>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Output</div>
                                                    <code className="block bg-zinc-950 text-green-400 p-2 rounded border border-zinc-800 font-mono">
                                                        {tc.expected}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {tags.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(t => (
                                            <span key={t} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-gray-400 font-medium">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>


                    </div>
                </div>

                {/* Center Column: Editor (50%) */}
                <div className="flex-1 min-w-[400px] flex flex-col bg-zinc-900 border-r border-zinc-800 z-0 relative">
                    {/* Editor Tabs */}
                    <div className="flex bg-black border-b border-zinc-800">
                        <button
                            onClick={() => setView('code')}
                            className={cn("px-6 py-3 text-sm font-medium border-t-2 transition-colors flex items-center gap-2",
                                view === 'code' || view === 'solution' ? "border-blue-500 text-gray-100 bg-zinc-900" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-900/50")}
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500/50" />
                            Your Code
                        </button>
                        <button
                            onClick={() => {
                                if (showAnswer) {
                                    setView('solution');
                                } else {
                                    if (confirm("Are you sure you want to reveal the solution? Try solving it first!")) {
                                        setShowAnswer(true);
                                        setView('solution');
                                    }
                                }
                            }}
                            className={cn("px-6 py-3 text-sm font-medium border-t-2 transition-colors flex items-center gap-2",
                                view === 'solution' ? "border-green-500 text-gray-100 bg-zinc-900" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-900/50")}
                        >
                            {showAnswer ? <Eye className="w-3 h-3" /> : <div className="w-3 h-3 rounded-sm border border-current opacity-50" />}
                            Solution
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative">
                        {view === 'solution' && showAnswer ? (
                            <Editor
                                defaultLanguage="javascript"
                                value={question.solutionCode}
                                theme="vs-dark"
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 20 },
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        ) : (
                            <CodeWorkspace code={code} onChange={setCode} />
                        )}
                    </div>
                </div>

                {/* Right Column: Preview & Chat (25%) */}
                <div className="w-[25%] min-w-[320px] bg-black flex flex-col">
                    {/* Tabs */}
                    <div className="flex bg-zinc-900 border-b border-zinc-800">
                        <button
                            onClick={() => setRightPanel('preview')}
                            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                                rightPanel === 'preview' ? "border-blue-500 text-gray-100 bg-zinc-800/50" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/30")}
                        >
                            Output
                        </button>
                        <button
                            onClick={() => setRightPanel('chat')}
                            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                                rightPanel === 'chat' ? "border-purple-500 text-gray-100 bg-zinc-800/50" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-zinc-800/30")}
                        >
                            AI Tutor
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {rightPanel === 'preview' ? (
                            <TestResults results={testResults} isRunning={isRunning} />
                        ) : (
                            <ChatWindow questionId={question.id} currentCode={code} />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
