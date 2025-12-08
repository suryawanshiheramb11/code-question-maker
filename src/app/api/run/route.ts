import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatModel } from '@/lib/gemini';
import vm from 'vm';

export async function POST(request: NextRequest) {
    try {
        const { questionId, code } = await request.json();

        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { testCases: true }
        });

        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        const isManual = question.testCases.some(tc => tc.type === 'manual');

        // AI Verification for DOM/UI/Manual Questions
        if (isManual) {
            try {
                // Helper to extract script content
                const getScriptContent = (html: string) => {
                    const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
                    return match ? match[1].trim() : html.trim();
                };

                const instructorScript = getScriptContent(question.solutionCode || '');
                const studentScript = getScriptContent(code || '');

                // 1. FAST PATH: Exact Logic Match
                const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
                if (normalize(instructorScript) === normalize(studentScript)) {
                    console.log("Trace: Exact script match found. Bypassing AI.");
                    return NextResponse.json({
                        runs: question.testCases.map(tc => ({
                            id: tc.id,
                            status: 'pass',
                            expected: tc.expected,
                            actual: 'Exact match with instructor logic',
                            stdout: 'Exact match verified',
                            stderr: null
                        })),
                        summary: {
                            total: question.testCases.length,
                            passed: question.testCases.length,
                            failed: 0
                        }
                    });
                }

                console.log("--- AI VERIFICATION DEBUG ---");
                // ... (logs)

                const prompt = `
                You are an expert coding instructor.
                Your task is to verify if the STUDENT'S CODE solves the PROBLEM correctly, specifically checking for LOGICAL CORRECTION.
                
                CRITICAL INSTRUCTION: 
                - You are checking for "Logical Correction".
                - If the student's logic effectively solves the problem and matches the intent of the instructor's logic, YOU MUST PASS IT.
                - Do not be pedantic about variable names or minor syntax differences.
                - Ensure the core logic (event listeners, DOM manipulation, algorithm) is correct.
                
                PROBLEM:
                Title: ${question.title}
                Description: ${question.description}

                INSTRUCTOR SOLUTION (Reference Logic):
                ${instructorScript}

                STUDENT CODE (Logic to Verify):
                ${studentScript}

                TEST CASES TO VERIFY:
                ${JSON.stringify(question.testCases.map(tc => ({ id: tc.id, expected: tc.expected })))}

                INSTRUCTIONS:
                1. Analyze the student's logic step-by-step.
                2. Does it achieve the same result as the instructor's solution?
                3. If yes, mark all tests as "pass".
                
                Respond ONLY with a JSON object:
                {
                    "summary": { "passed": number, "failed": number, "total": number },
                    "runs": [
                        { "id": "test-case-id", "status": "pass" | "fail", "actual": "Explanation" }
                    ]
                }
                `;

                console.log("Sending Prompt to Gemini...");
                const result = await chatModel.generateContent(prompt);
                const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                console.log("Gemini Response:", responseText);
                const evaluation = JSON.parse(responseText);

                // Map back to expected format
                const runs = evaluation.runs.map((r: any) => {
                    const originalTC = question.testCases.find(t => t.id === r.id);
                    return {
                        id: r.id,
                        status: r.status,
                        expected: originalTC?.expected || 'Passed',
                        actual: r.actual,
                        stdout: r.status === 'pass' ? 'Logic verified by AI' : 'Logic verification failed',
                        stderr: r.status === 'fail' ? r.actual : null
                    };
                });

                return NextResponse.json({
                    runs,
                    summary: {
                        total: question.testCases.length,
                        passed: evaluation.summary.passed,
                        failed: evaluation.summary.failed
                    }
                });

            } catch (e: any) {
                console.error("AI Eval Failed:", e);
                // Return generic error run
                return NextResponse.json({
                    runs: question.testCases.map(tc => ({
                        id: tc.id,
                        status: 'error',
                        expected: tc.expected,
                        actual: "AI Verification Failed",
                        stderr: e.message
                    })),
                    summary: { total: question.testCases.length, passed: 0, failed: question.testCases.length }
                });
            }
        }

        // Standard VM Execution for purely algorithmic questions
        const runs = [];
        let passed = 0;

        // Prepare context
        let logs: string[] = [];
        const sandbox = {
            console: {
                log: (...args: any[]) => logs.push(args.map(a => String(a)).join(' ')),
                error: (...args: any[]) => logs.push("[ERR] " + args.map(a => String(a)).join(' ')),
            },
        };
        const context = vm.createContext(sandbox);

        // Run wrapper logic
        const runWrapper = `
            ${code}
            ;(function() {
                try {
                     if (typeof solution !== 'undefined') return solution;
                     if (typeof solve !== 'undefined') return solve;
                     return null;
                } catch(e) { return null; }
            })();
        `;

        let userFn: any;
        try {
            userFn = vm.runInContext(runWrapper, context, { timeout: 1000 });
        } catch (e: any) {
            return NextResponse.json({ error: "Compilation Error: " + e.message }, { status: 200 });
        }

        if (typeof userFn !== 'function') {
            return NextResponse.json({
                error: "Function 'solution' or 'solve' not found",
                runs: []
            }, { status: 200 });
        }

        // Execute tests
        for (const tc of question.testCases) {
            logs = [];
            let status = 'fail';
            let actual: any = null;
            let errorVal = null;

            try {
                let args: any[] = [];
                try {
                    args = tc.stdin ? [JSON.parse(tc.stdin)] : [];
                } catch {
                    args = [tc.stdin];
                }

                // Call function
                const result = userFn.apply(null, args);
                actual = result;

                // Check result
                const expectedStr = tc.expected?.trim();
                let match = false;
                try {
                    // JSON compare
                    if (JSON.stringify(result) === JSON.stringify(JSON.parse(expectedStr || 'null'))) match = true;
                } catch {
                    // String compare
                    if (String(result) === expectedStr) match = true;
                }

                if (match) {
                    status = 'pass';
                    passed++;
                }
            } catch (e: any) {
                status = 'error';
                errorVal = e.message;
            }

            runs.push({
                id: tc.id,
                status,
                expected: tc.expected,
                actual: errorVal || String(actual),
                stdout: logs.join('\n'),
                stderr: errorVal
            });
        }

        return NextResponse.json({
            runs,
            summary: {
                total: question.testCases.length,
                passed,
                failed: question.testCases.length - passed
            }
        });

    } catch (error) {
        console.error('Run error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
