"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
    questionId: string;
    currentCode: string;
}

export function ChatWindow({ questionId, currentCode }: ChatWindowProps) {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId,
                    currentCode,
                    messages: [...messages, { role: 'user', content: userMsg }]
                })
            });

            if (!res.body) throw new Error("No response");

            // Handle streaming response
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let assistantMsg = "";

            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                assistantMsg += chunk;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = assistantMsg;
                    return newMsgs;
                });
            }

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not get response." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black border-l border-zinc-800 shadow-xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-sm text-gray-200">AI Assistant</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        Ask for help with this question.
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={cn("flex gap-2 text-sm", m.role === 'user' ? "flex-row-reverse" : "")}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            m.role === 'user' ? "bg-zinc-800" : "bg-purple-900/30"
                        )}>
                            {m.role === 'user' ? <User className="w-4 h-4 text-gray-400" /> : <Bot className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div className={cn(
                            "p-3 rounded-lg max-w-[85%] whitespace-pre-wrap",
                            m.role === 'user' ? "bg-zinc-800 text-gray-200" : "bg-zinc-900 border border-zinc-800 text-gray-300"
                        )}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Bot className="w-4 h-4" />
                        Thinking...
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-black">
                <div className="flex gap-2">
                    <input
                        className="flex-1 border border-zinc-700 bg-zinc-900 text-white rounded-lg px-3 py-2 text-sm focus:ring-1 ring-purple-500 outline-none placeholder:text-gray-500"
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
