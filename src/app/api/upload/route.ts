import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const uploadDir = join(process.cwd(), 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // ignore if exists
        }

        const uploadedFiles = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileId = uuidv4();
            const ext = file.name.split('.').pop();
            const fileName = `${fileId}.${ext}`;
            const filePath = join(uploadDir, fileName);

            await writeFile(filePath, buffer);

            uploadedFiles.push({
                id: fileId,
                originalName: file.name,
                path: filePath,
                mimeType: file.type
            });
        }

        return NextResponse.json({
            uploadId: uuidv4(),
            files: uploadedFiles
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
