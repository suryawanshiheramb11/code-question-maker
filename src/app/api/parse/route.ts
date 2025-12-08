import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { parseContent } from '@/lib/parsing/service';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
// Prompt: "returns: { parseId, items: [...] }"
// And "Allow manual edit UI... per unit".
// So I should probably return the items to frontend, frontend shows them, user edits, then SAVE.
// But the prompt also mentions: "Store original raw text with each parsed item".
// I'll return the JSON for the frontend to edit.

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileIds, filePaths } = body; // expect filePaths or look them up?
        // The upload response returned paths. Frontend can send them back or send IDs and I look them up.
        // Ideally I should persist upload info in DB (Attachments) first?
        // But for now, I'll trust the checked files passed from upload response or store them in a temp DB table?
        // Simpler: The upload API returned paths. Frontend sends paths back (secure? No, path traversal risk).
        // Better: Upload API saves metadata to DB or returning IDs, and Parse API looks up by ID.
        // I haven't created an "Upload" model.
        // I'll assume for this turn that Frontend sends the full path returned by Upload (in MVP).
        // Validate path is inside `uploads/` to be safe.

        // Actually, let's just make Upload API return ID and I scan `uploads/` for ID or use a map.
        // I'll use IDs. Filename is `${id}.${ext}`.

        if (!fileIds || !Array.isArray(fileIds)) {
            return NextResponse.json({ error: 'Invalid fileIds' }, { status: 400 });
        }

        const parsedItems = [];

        const uploadDir = join(process.cwd(), 'uploads');

        // Prepare batched content for Gemini? Or one by one?
        // Gemini supports multiple files in one request.
        const fileParts = [];

        for (const fileObj of fileIds) {
            // fileObj might be { id, mimeType, ext } or just id
            // Let's assume input is array of objects from upload response
            // But the prompt example: POST /api/parse body: { fileIds }
            // I will assume fileIds are strings and I find the file.
            // But I don't know the extension.
            // So I'll require { id, originalName } or just scan dir?
            // Let's use `fs.readdir` to find matches or store metadata mapping.
            // Hack: Client sends { id, path, mimeType } (from upload response).

            const path = fileObj.path;
            // Verify path traversal
            if (!path.startsWith(uploadDir)) {
                continue; // malicious or invalid
            }

            const data = await readFile(path);
            const base64 = data.toString('base64');

            fileParts.push({
                mimeType: fileObj.mimeType || 'application/octet-stream', // guess or from client
                data: base64
            });
        }

        if (fileParts.length === 0) {
            return NextResponse.json({ error: 'No valid files found' }, { status: 400 });
        }

        // Call parsing service
        const items = await parseContent("", fileParts);

        // Add UUIDs if missing
        const enhancedItems = items.map(item => ({
            ...item,
            id: item.id || uuidv4(),
            parseId: uuidv4() // transient ID
        }));

        return NextResponse.json({ items: enhancedItems });

    } catch (error: any) {
        console.error('Parse error:', error);
        // Extract meaningful message from Gemini error
        const msg = error.message || 'Internal Server Error';
        if (msg.includes('429')) {
            return NextResponse.json({ error: 'Gemini Quota Exceeded (429). Please try again later or use a different key.' }, { status: 429 });
        }
        if (msg.includes('404')) {
            return NextResponse.json({ error: 'Gemini Model Not Found (404). Check API config.' }, { status: 404 });
        }
        return NextResponse.json({ error: `Parse Error: ${msg}` }, { status: 500 });
    }
}
