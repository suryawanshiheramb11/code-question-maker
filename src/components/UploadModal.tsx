"use client";

import { useState, useCallback } from 'react';
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadModalProps {
    onClose: () => void;
    onParseComplete: (items: any[]) => void;
}

export function UploadModal({ onClose, onParseComplete }: UploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setStatus("Uploading files...");
        setError(null);

        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));

            // 1. Upload
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();

            setStatus("Parsing content with AI...");

            // 2. Parse
            const parseRes = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileIds: uploadData.files }),
            });

            if (!parseRes.ok) {
                let errorMessage = 'Parsing failed';
                try {
                    const errData = await parseRes.json();
                    if (errData.error) errorMessage = errData.error;
                } catch (e) { }
                throw new Error(errorMessage);
            }
            const parseData = await parseRes.json();

            onParseComplete(parseData.items);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-lg">Upload Questions</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative"
                    >
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <Upload className="w-10 h-10 text-gray-400" />
                            <p className="text-sm text-gray-600 font-medium">Drag & Drop files here or click to browse</p>
                            <p className="text-xs text-gray-400">PDF, PNG, JPG, MD, TXT supported</p>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded border text-sm">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="truncate flex-1">{f.name}</span>
                                    <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleUpload}
                            disabled={files.length === 0 || isUploading}
                            className={cn(
                                "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                                files.length === 0 || isUploading
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                            )}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {status || "Processing..."}
                                </>
                            ) : (
                                "Upload & Parse"
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
