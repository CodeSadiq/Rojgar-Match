import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userProfile, matchedPosts } = await req.json();

    if (!matchedPosts || matchedPosts.length === 0) {
      return NextResponse.json({ questions: [] });
    }
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

      STRICT RULES:
      1. SOURCE-LOCKED: ONLY use text found in "prerequisite" and "qualification.extraQualificationText". 
      2. NO INFERENCE: Do NOT use the job titles/designations to guess or infer requirements from your internal knowledge. If a requirement is not explicitly written in the source fields, it does not exist.
      3. IGNORE GENERIC TEXT: Ignore sentences that are just document references (e.g., "As per SSB Notification", "According to advertisement", "See website for details", "As per Recruitment 2026 Notification"). 
      4. NULL CASE: If the source fields ("prerequisite" and "extraQualificationText") ONLY contain generic references or are empty, you MUST generate ZERO questions for that post.
      5. EXCLUSION RULE: Only skip requirements that are EXACTLY and EXPLICITLY matched in the USER PROFILE "qualifications" array. 
      6. GAP ANALYSIS: If a post requires a specific degree, diploma, or certificate (e.g., B.Ed, D.El.Ed, BTC, ITI) and the user has not listed that EXACT qualification in their profile, you MUST generate a question for it. 
      7. AVOID DUPLICATES: Do NOT generate questions for requirements already mentioned in USER PROFILE, already answered in "screeningAnswers", or ALREADY ASKED in "existingQuestions".
      8. PHASED SCREENING: Generate a MAXIMUM of 5 questions. Focus on:
         a) Major academic gaps (e.g., if B.Ed is required but missing from profile).
         b) Specialized certifications (CCC, NCC, O-Level).
         c) Physical standards and work experience.
      9. Generate ONE separate question for EACH distinct specialized requirement.
      10. Do NOT merge or combine different requirements into a single question.
      11. Return a JSON array of objects with: "id", "text", "category", and "impactedPostNames".
      12. RETURN ONLY THE JSON ARRAY. No explanation, no markdown.
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
