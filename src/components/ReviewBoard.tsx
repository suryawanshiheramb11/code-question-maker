"use client";

import { useState } from 'react';
import { Save, Trash, Plus, RotateCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';

interface ReviewBoardProps {
    items: any[];
    onSave: () => void;
    onCancel: () => void;
}

export function ReviewBoard({ items: initialItems, onSave, onCancel }: ReviewBoardProps) {
    const [items, setItems] = useState(initialItems);
    const [activeId, setActiveId] = useState(initialItems[0]?.id);
    const [isSaving, setIsSaving] = useState(false);

    const activeItem = items.find(i => i.id === activeId);

    const updateItem = (id: string, field: string, value: any) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                body: JSON.stringify({ questions: items }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error("Failed to save");
            onSave();
        } catch (e) {
            alert("Error saving questions");
            console.error(e);
            setIsSaving(false);
        }
    };

    if (!activeItem) return null;

    return (
        <div className="flex h-screen bg-black text-gray-200">
            {/* Sidebar List */}
            <div className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                    <h2 className="font-bold text-gray-200">Parsed Items ({items.length})</h2>
                    <button onClick={onCancel} className="text-xs text-gray-500 hover:text-red-500">Discard</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setActiveId(item.id)}
                            className={cn(
                                "p-3 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors",
                                activeId === item.id ? "bg-zinc-800 border-l-4 border-l-blue-500" : ""
                            )}
                        >
                            <div className="font-medium text-sm truncate text-gray-300">{item.title || "Untitled"}</div>
                            <div className="text-xs text-gray-500 truncate mt-1">{item.description?.substring(0, 50)}...</div>
                            <div className="flex gap-2 mt-2">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                                    item.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        item.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                )}>{item.difficulty}</span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                    Tests: {item.testCases?.length || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium flex items-center justify-center gap-2"
                    >
                        {isSaving ? <RotateCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save All to DB
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Fields */}
                <div className="p-6 border-b border-zinc-800 bg-black space-y-4 overflow-y-auto max-h-[40vh]">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                            <input
                                className="w-full text-xl font-bold border-b border-zinc-700 bg-transparent focus:border-blue-500 outline-none py-1 text-blue-400"
                                value={activeItem.title || ''}
                                onChange={e => updateItem(activeId, 'title', e.target.value)}
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-xs font-bold text-gray-500 uppercase">Difficulty</label>
                            <select
                                className="w-full border border-zinc-700 p-1 rounded mt-1 text-sm bg-zinc-900 text-white outline-none focus:border-blue-500"
                                value={activeItem.difficulty || 'Unknown'}
                                onChange={e => updateItem(activeId, 'difficulty', e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                            className="w-full border border-zinc-700 rounded p-2 text-sm mt-1 h-24 focus:ring-1 ring-blue-500 outline-none bg-zinc-900 text-gray-300"
                            value={activeItem.description || ''}
                            onChange={e => updateItem(activeId, 'description', e.target.value)}
                        />
                    </div>

                    {/* Test Cases Quick View */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Test Cases</label>
                        </div>
                        <div className="space-y-2">
                            {activeItem.testCases?.map((tc: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center text-sm">
                                    <span className="font-mono text-xs text-gray-400">#{idx + 1}</span>
                                    <input className="border border-zinc-700 bg-zinc-900 text-white rounded px-2 py-1 flex-1 font-mono text-xs" value={tc.stdin} placeholder="Input" onChange={(e) => {
                                        const newTCs = [...activeItem.testCases];
                                        newTCs[idx].stdin = e.target.value;
                                        updateItem(activeId, 'testCases', newTCs);
                                    }} />
                                    <span className="text-gray-500">→</span>
                                    <input className="border border-zinc-700 bg-zinc-900 text-white rounded px-2 py-1 flex-1 font-mono text-xs" value={tc.expected} placeholder="Expected" onChange={(e) => {
                                        const newTCs = [...activeItem.testCases];
                                        newTCs[idx].expected = e.target.value;
                                        updateItem(activeId, 'testCases', newTCs);
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Codes Grid */}
                <div className="flex-1 min-h-0 grid grid-cols-2 gap-px bg-zinc-800 pt-px">
                    {/* Starter Code */}
                    <div className="flex flex-col bg-black">
                        <div className="px-6 flex justify-between items-center bg-black border-b border-zinc-800 py-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Starter Code</label>
                            <span className="text-xs text-blue-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">HTML</span>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                defaultLanguage="html"
                                theme="vs-dark"
                                value={activeItem.starterCode || ''}
                                onChange={(val) => updateItem(activeId, 'starterCode', val)}
                                options={{ minimap: { enabled: false }, fontSize: 13 }}
                            />
                        </div>
                    </div>

                    {/* Solution Code */}
                    <div className="flex flex-col bg-black">
                        <div className="px-6 flex justify-between items-center bg-black border-b border-zinc-800 py-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Solution Code</label>
                            <span className="text-xs text-green-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">Javascript</span>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={activeItem.solutionCode || ''}
                                onChange={(val) => updateItem(activeId, 'solutionCode', val)}
                                options={{ minimap: { enabled: false }, fontSize: 13 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
