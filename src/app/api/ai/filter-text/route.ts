import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userText, matchedPosts } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API Key Missing' }, { status: 500 });
    }

    const prompt = `
      You are an expert Government Recruitment Eligibility Checker.
      
      USER QUALIFICATION DESCRIPTION:
      "${userText}"
      (Note: The user may provide their details in English, Hindi, or Hinglish. Understand the meaning accurately regardless of the language.)

      JOB REQUIREMENTS TO CHECK (MATCHED POSTS):
      ${JSON.stringify(matchedPosts)}

      TASK:
      1. Analyze the user's description against the job requirements:
         - "qualification.name": The core education level (e.g., 10th, 12th, Graduate, B.Tech).
         - "course": Specific required subjects or branches.
         - "prerequisite" & "qualification.extraQualificationText": Additional certifications or experience.
      2. ONLY BLOCK a post if the user's details EXPLICITLY show they are NOT eligible.
      3. CRITICAL: If the user says they are "uneducated", "illiterate", or have "no degree/diploma", BLOCK all jobs that require any educational level (10th, 12th, Degree, etc.).
      4. For example: 
         - If a job requires "Graduate" and the user says "mai uneducated hu", BLOCK it.
         - If a job requires "B.Tech" and the user has "Diploma", BLOCK it.
         - If a job requires "NCC Certificate" and the user DOES NOT mention it, DO NOT BLOCK (Assume "Not Sure").
      5. IMPORTANT: Understand Hinglish/Hindi context. "mai uneducated hu" or "mere pass koi degree nahi hai" means they lack all formal academic qualifications.
      6. Be lenient otherwise. Only block if there is a clear mismatch.
      
      OUTPUT FORMAT:
      Return a JSON object with a single key "blockedPostNames" which is an array of names of the posts the user is definitely NOT eligible for.
      
      RETURN ONLY THE JSON.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-001",
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[AI Filter API Error Data]:', data);
      throw new Error(data.error?.message || `AI Call Failed (${response.status})`);
    }

    if (!data.choices || !data.choices[0]) {
      console.error('[AI Filter Debug - No choices]:', data);
      throw new Error('AI returned no results');
    }

    const aiText = data.choices[0].message.content;
    console.log('[AI Filter Debug - Raw Text]:', aiText);

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI Filter Debug - Regex failed]:', aiText);
      throw new Error('Invalid JSON format from AI');
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    } catch (e: any) {
      console.error('[AI Filter Debug - Parse failed]:', jsonMatch[0]);
      throw new Error(`JSON parse failed: ${e.message}`);
    }

  } catch (error: any) {
    console.error('[AI Filter Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
