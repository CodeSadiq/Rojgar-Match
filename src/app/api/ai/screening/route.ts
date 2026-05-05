import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userProfile, matchedPosts } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API Key Missing' }, { status: 500 });
    }

    const prompt = `
      You are an expert Government Recruitment Screener.
      Analyze these job requirements and generate Yes/No screening questions.

      USER PROFILE:
      ${JSON.stringify(userProfile)}

      MATCHED POST DETAILS:
      ${JSON.stringify(matchedPosts)}

      RULES:
      1. SOURCE DATA: Use "prerequisite" and "qualification.extraQualificationText" to find screening requirements.
      2. EXCLUSION RULE: Use the user's profile and the job's "qualification.name" and "course" fields to identify basic requirements. Do NOT generate questions for anything already covered by these fields (e.g., if a post requires "12th" in "Science" or "B.Tech", do not ask about them).
      3. CRITICAL: Do NOT generate questions for requirements that are already explicitly mentioned in the USER PROFILE. 
      4. Focus ONLY on specialized prerequisites: specific certifications (e.g., CCC, NCC, O-Level), physical standards (height/weight), work experience, or specialized skills.
      5. Generate ONE separate question for EACH distinct specialized requirement.
      6. Do NOT merge or combine different requirements into a single question.
      7. Return a JSON array of objects with: "id", "text", "category", and "impactedPostNames".
      8. RETURN ONLY THE JSON ARRAY. No explanation, no markdown.
    `;

    // Calling OpenRouter API with a cost-effective & fast model
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://rojgarmatch.com",
        "X-Title": "Rojgar Match"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001", // Fast, Cheap, and Reliable for high traffic
        "messages": [
          { "role": "user", "content": prompt }
        ]
      })
    });

    // Safety check for non-JSON response from OpenRouter
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      throw new Error(`OpenRouter returned non-JSON response (${response.status}): ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenRouter API failed with status ${response.status}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[OpenRouter No Choices Error]:', data);
      throw new Error('AI provider returned an empty or invalid response');
    }

    const aiText = data.choices[0].message.content;

    // Clean JSON extraction
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid JSON format from AI');

    const questions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ questions });

  } catch (error: any) {
    console.error('[OpenRouter API Error]:', error.message);
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
