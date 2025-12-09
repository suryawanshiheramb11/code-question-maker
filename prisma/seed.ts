import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), 'htg.txt');

    if (!fs.existsSync(filePath)) {
        console.error('htg.txt not found');
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    // Split by "---" but we need to arguably be smarter if "---" appears in code.
    // Based on the file view, "---" is used as a separator between sections and problems.
    // However, "Problem X" always starts with "# 🔵 Problem".
    // Let's split by the problem header.

    const problemRegex = /# 🔵 Problem \d+ – ([^\n]+)/g;
    let match;
    const indices: number[] = [];

    // Find all start indices of problems
    while ((match = problemRegex.exec(content)) !== null) {
        indices.push(match.index);
    }

    const problems = [];

    for (let i = 0; i < indices.length; i++) {
        const start = indices[i];
        const end = indices[i + 1] || content.length;
        const problemText = content.slice(start, end);
        problems.push(problemText);
    }

    console.log(`Found ${problems.length} problems in htg.txt`);

    for (const info of problems) {
        await processProblem(info);
    }
}

async function processProblem(text: string) {
    // Extract Title
    const titleMatch = text.match(/# 🔵 Problem \d+ – ([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';

    // Extract Starter Code
    const starterCodeMatch = text.match(/### 📄 \*\*Starter Code\*\*\s+```\w*\n([\s\S]*?)```/);
    const starterCode = starterCodeMatch ? starterCodeMatch[1] : '';

    // Extract Solution Code
    const solutionCodeMatch = text.match(/### 🧑‍🏫 \*\*Instructor Solution\*\*\s+```\w*\n([\s\S]*?)```/);
    const solutionCode = solutionCodeMatch ? solutionCodeMatch[1] : '';

    // Extract Description (Problem Statement)
    // We'll combine Statement, Hint, Expected Behaviour into the description
    let description = '';

    const statementMatch = text.match(/### ✅ \*\*Problem Statement\*\*([\s\S]*?)(?=###|$|---)/);
    if (statementMatch) {
        description += `### Problem Statement\n${statementMatch[1].trim()}\n\n`;
    }

    const hintMatch = text.match(/### 🔍 \*\*Subtle Hint\*\*([\s\S]*?)(?=###|$|---)/);
    if (hintMatch) {
        description += `### Hint\n${hintMatch[1].trim()}\n\n`;
    }

    const expectedMatch = text.match(/### 🎯 \*\*Expected Behaviour\*\*([\s\S]*?)(?=###|$|---)/);
    if (expectedMatch) {
        description += `### Expected Behaviour\n${expectedMatch[1].trim()}\n\n`;
    }

    const testCasesMatch = text.match(/### 🧪 \*\*Test Cases\*\*([\s\S]*?)(?=###|$|---)/);
    if (testCasesMatch) {
        description += `### Test Cases\n${testCasesMatch[1].trim()}\n\n`;
    }

    // Tags extraction (Heuristic)
    const tags = ['Frontend', 'DOM']; // Default tags
    if (title.toLowerCase().includes('react')) tags.push('React');
    if (text.includes('localStorage')) tags.push('Storage');
    if (text.includes('fetch')) tags.push('API');

    // Upsert the question
    // We use title as a unique key for upserting logic (conceptually), but since schema doesn't enforce it,
    // we first check if it exists.

    const existing = await prisma.question.findFirst({
        where: { title: title }
    });

    if (existing) {
        console.log(`Updating question: ${title}`);
        await prisma.question.update({
            where: { id: existing.id },
            data: {
                description,
                starterCode,
                solutionCode,
                tags: JSON.stringify(tags),
            }
        });
    } else {
        console.log(`Creating question: ${title}`);
        await prisma.question.create({
            data: {
                title,
                description,
                difficulty: 'Medium', // Default
                starterCode,
                solutionCode,
                tags: JSON.stringify(tags),
            }
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
