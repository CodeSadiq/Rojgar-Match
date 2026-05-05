import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Directly importing the library logic to avoid the buggy index.js 
    // which incorrectly enters debug mode in some environments.
    const pdf = require('pdf-parse/lib/pdf-parse.js');
    
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Buffer created, calling pdf-parse...');
    
    const data = await pdf(buffer);
    console.log('pdf-parse complete');
    
    const resumeText = data.text;

    if (!resumeText || resumeText.trim().length < 50) {
      console.warn('Extracted text too short:', resumeText?.length);
      return NextResponse.json({ error: 'Could not extract enough text from resume' }, { status: 400 });
    }

    return NextResponse.json({ text: resumeText });

  } catch (error: any) {
    console.error('[Resume Analysis Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze resume' }, { status: 500 });
  }
}
