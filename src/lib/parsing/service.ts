import { parserModel } from '../gemini';
import { PARSER_SYSTEM_PROMPT } from './prompts';
import { v4 as uuidv4 } from 'uuid';

export interface ParsedQuestion {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    starterCode: string;
    solutionCode: string;
    testCases: {
        id: string;
        type: string;
        stdin: string;
        expected: string;
        notes?: string;
    }[];
    confidence: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Heuristic Regex Parser (Offline Mode)
function parseContentHeuristic(text: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];

    // Split by Problem Header
    // Regex lookahead to find "# 🔵 Problem"
    // We add a dummy delimiter to finding the start
    const problemRegex = /# 🔵 Problem/g;

    // If no problem header found, treat as single question (fallback)
    if (!text.match(problemRegex)) {
        return parseSingleQuestion(text);
    }

    // Split the text. The split will result in [preamble, problem 1, problem 2, ...]
    // We use a capture group in split if we want to keep delimiter, but purely splitting by the header pattern is easier if we prepend it back.
    const chunks = text.split(problemRegex); // [preamble, " 1 - ...", " 2 - ..."]

    for (const chunk of chunks) {
        if (!chunk.trim()) continue;
        if (chunk.length < 50) continue; // Skip noise

        // Reconstruct the full text for this problem (prepend "Problem")
        const fullChunk = "Problem " + chunk;
        questions.push(parseSingleBlock(fullChunk));
    }

    return questions;
}

function parseSingleQuestion(text: string): ParsedQuestion[] {
    return [parseSingleBlock(text)];
}

function parseSingleBlock(text: string): ParsedQuestion {
    // 1. Title: First non-empty line
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    // Remove "Problem X – " prefix if present
    const rawTitle = lines[0] || "Untitled Question";
    const title = rawTitle.replace(/^Problem\s*\d+\s*[–-]\s*/, '').replace(/^#+\s*/, '').trim();

    // 2. Description: Text until "Starter Code" or "Instructor Solution"
    // The htg.txt format has "### 📄 **Starter Code**" and "### 🧑‍🏫 **Instructor Solution**"
    const solutionMarkerRegex = /(?:###\s*🧑‍🏫\s*\*\*Instructor Solution\*\*|Instructor Solution|###\s*Solution)/i;
    const starterMarkerRegex = /(?:###\s*📄\s*\*\*Starter Code\*\*|Starter Code)/i;

    const solutionMatch = text.match(solutionMarkerRegex);
    const starterMatch = text.match(starterMarkerRegex);

    // End of description is usually before Starter Code or Solution
    let descEndIndex = text.length;
    if (starterMatch && starterMatch.index) descEndIndex = Math.min(descEndIndex, starterMatch.index);
    if (solutionMatch && solutionMatch.index) descEndIndex = Math.min(descEndIndex, solutionMatch.index);

    const description = text.substring(0, descEndIndex).replace(lines[0], '').trim(); // Remove title line from desc

    // 3. Starter Code
    let starterCode = "";
    if (starterMatch && starterMatch.index) {
        // Extract up to solution or end
        const afterStarter = text.substring(starterMatch.index);
        const limitIndex = solutionMatch ? (solutionMatch.index! - starterMatch.index) : afterStarter.length;
        const starterSection = afterStarter.substring(0, limitIndex);

        const codeBlockRegex = /```(?:html|javascript|js)?\s*([\s\S]*?)```/i;
        const codeMatch = starterSection.match(codeBlockRegex);
        if (codeMatch) {
            starterCode = codeMatch[1].trim();
        }
    }

    // 4. Solution Code
    // Extract code block after "Instructor Solution"
    let solutionCode = "";
    if (solutionMatch && solutionMatch.index) {
        const afterSolution = text.substring(solutionMatch.index);
        const codeBlockRegex = /```(?:javascript|js)?\s*([\s\S]*?)```/i;
        const codeMatch = afterSolution.match(codeBlockRegex);
        if (codeMatch) {
            solutionCode = codeMatch[1].trim();
        }
    }

    // If no solution found, try to find any JS block that looks like a solution (fallback)
    // Be careful not to grab starter code if it mimics solution
    if (!solutionCode) {
        const allCodeMatches = [...text.matchAll(/```(?:javascript|js)\s*([\s\S]*?)```/gi)];
        // Usually the last code block is the solution in this format?
        if (allCodeMatches.length > 0) {
            // Logic check: if we have starter code, make sure this isn't the same block
            const candidate = allCodeMatches[allCodeMatches.length - 1][1].trim();
            if (candidate !== starterCode) {
                solutionCode = candidate;
            }
        }
    }

    // 5. Test Cases
    // Look for "### 🧪 **Test Cases**"
    const testMarkerRegex = /(?:###\s*🧪\s*\*\*Test Cases\*\*|Test Cases)/i;
    const testMatch = text.match(testMarkerRegex);
    const testCases: any[] = [];

    if (testMatch && testMatch.index) {
        const afterTests = text.substring(testMatch.index);
        // Look for numbered list items: "1. Click..."
        const listRegex = /\d+\.\s*(.+)/g;
        const matches = [...afterTests.matchAll(listRegex)];

        // For these GUI/DOM problems, we can't easily parse input/output.
        // We will store the description of the test case as 'notes' or 'expected'.
        for (const m of matches) {
            testCases.push({
                id: uuidv4(),
                type: 'manual', // Manual test case
                stdin: '-',
                expected: m[1].trim()
            });
        }
    }

    return {
        id: uuidv4(),
        title,
        description,
        difficulty: "Medium",
        tags: ["JavaScript", "DOM", "Practice"],
        starterCode: starterCode || "// Write your code here",
        solutionCode: solutionCode || "// No solution code found",
        testCases,
        confidence: 0.8
    };
}

export async function parseContent(text: string, fileParts: { mimeType: string; data: string }[] = []) {
    console.log("Using Heuristic Parser (Offline Mode)");

    // 1. Combine text
    let codeContent = text || "";

    // 2. Decode file parts (base64) => text if possible
    for (const part of fileParts) {
        if (part.mimeType.startsWith('text/') || part.mimeType === 'application/json') {
            const buff = Buffer.from(part.data, 'base64');
            codeContent += "\n" + buff.toString('utf-8');
        }
    }

    if (!codeContent.trim()) {
        throw new Error("No text content found to parse.");
    }

    return parseContentHeuristic(codeContent);
}
