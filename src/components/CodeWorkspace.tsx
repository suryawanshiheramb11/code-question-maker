"use client";

import Editor from '@monaco-editor/react';

interface CodeWorkspaceProps {
    code: string;
    onChange: (value: string) => void;
}

export function CodeWorkspace({ code, onChange }: CodeWorkspaceProps) {
    return (
        <div className="flex flex-col h-full bg-zinc-900 border-x border-zinc-800">
            {/* Toolbar */}
            <div className="bg-zinc-900 border-b border-zinc-700 p-2 flex justify-between items-center shrink-0 h-10">
                <h3 className="font-semibold text-sm text-gray-300 ml-2">index.html</h3>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={code}
                    theme="vs-dark"
                    onChange={(val) => onChange(val || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        renderValidationDecorations: "off",
                        quickSuggestions: false
                    }}
                />
            </div>
        </div>
    );
}
