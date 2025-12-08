import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResultsProps {
    results: any;
    isRunning: boolean;
}

export function TestResults({ results, isRunning }: TestResultsProps) {
    return (
        <div className="h-full bg-zinc-900 border border-zinc-700 rounded-lg text-gray-300 overflow-y-auto p-4 font-mono text-sm leading-relaxed">
            <div className="font-bold text-gray-500 mb-2 uppercase text-xs tracking-wider">Test / Preview Results</div>

            {isRunning && <div className="text-gray-400 italic">Running tests...</div>}

            {!isRunning && !results && <div className="text-gray-600">Click "Test" to see output.</div>}

            {results && results.error && (
                <div className="text-red-400 bg-red-900/20 p-2 rounded border border-red-900/30">{results.error}</div>
            )}

            {results && results.runs && (
                <div className="space-y-3">
                    {results.runs.map((run: any, i: number) => (
                        <div key={i} className="flex gap-3 bg-zinc-950 p-2 rounded border border-zinc-800">
                            <div className="mt-0.5">
                                {run.status === 'pass' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                            </div>
                            <div className="flex-1">
                                <div className={cn("font-bold text-xs mb-1", run.status === 'pass' ? "text-green-400" : "text-red-400")}>
                                    Test Case #{i + 1}: {run.status.toUpperCase()}
                                </div>
                                {run.status === 'fail' && (
                                    <div className="text-gray-400 text-xs mt-1 grid gap-1">
                                        <div className="bg-zinc-900 p-1 rounded">Expected: <span className="text-green-300">{run.expected}</span></div>
                                        <div className="bg-zinc-900 p-1 rounded">Got: <span className="text-red-300">{run.actual}</span></div>
                                    </div>
                                )}
                                {run.stdout && (
                                    <div className="mt-2 text-gray-500 text-xs pl-2 border-l border-gray-700">
                                        Logs: {run.stdout}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {results.summary && (
                        <div className="mt-4 pt-4 border-t border-zinc-800 text-sm flex gap-4 font-bold">
                            <span className="text-gray-400">Total: {results.summary.total}</span>
                            <span className="text-green-400">Passed: {results.summary.passed}</span>
                            <span className="text-red-400">Failed: {results.summary.failed}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
