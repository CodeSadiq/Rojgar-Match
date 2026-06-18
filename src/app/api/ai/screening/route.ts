import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userProfile, matchedPosts } = await req.json();

    if (!matchedPosts || matchedPosts.length === 0) {
      return NextResponse.json({ questions: [] });
    }
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.SCREENING_MODEL || "openai/gpt-4o-mini";

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
      1. COMPREHENSIVE SCAN: You MUST thoroughly scan and read ALL posts and details provided in the MATCHED POST DETAILS list. Analyze every single post's qualifications, prerequisites, and extra qualification text completely without missing or skipping any details.
      2. SOURCE-LOCKED: ONLY use text and requirements found in "prerequisite", "qualification.extraQualificationText", "qualification", and "educationRequirementForMatch".
      3. NO INFERENCE: Do NOT use the job titles/designations to guess or infer requirements from your internal knowledge. If a requirement is not explicitly written in the source fields, it does not exist.
      4. IGNORE GENERIC TEXT: Ignore sentences that are just document references (e.g., "As per SSB Notification", "According to advertisement", "See website for details", "As per Recruitment 2026 Notification").
      5. NULL CASE: If you find no academic gaps, specialized certifications, physical standards, or experience gaps to check (e.g. because the user's qualifications already match all criteria or the source fields are empty), you MUST generate ZERO questions.
      6. EXCLUSION RULE: Only skip requirements that are EXACTLY and EXPLICITLY matched in the USER PROFILE "qualifications" array.
      7. NO BASIC COURSE OR BRANCH QUESTIONS: Do NOT generate screening questions asking if the user has a basic degree, course, or branch (e.g., B.Tech, BCA, B.Sc, Graduation, etc.) that is part of the core educational requirements. These basic courses are already matched by the backend parser.
      8. HANDLE ALTERNATIVE 'OR' QUALIFICATIONS: If a post offers multiple alternative paths/qualifications (e.g., 'Graduation with PGDCA OR B.Tech in CS/IT OR BCA'), and the user already possesses AT LEAST ONE of these alternative degrees in their profile, DO NOT generate questions asking if they have the other alternative degrees (e.g., do not ask if they have PGDCA if they already have BCA/B.Tech). They only need to satisfy one path.
      9. SUBJECT/BRANCH CHECK: If the extra qualification text or prerequisites specify a particular subject, stream, branch, or coursework (e.g. Statistics, Physics, Mathematics at 12th standard, etc.) that the candidate must have studied, and that exact subject/stream is NOT listed in the candidate's profile qualifications branch field, you MUST generate a question for it.
      10. EXTRA CONDITIONS & MARKS CHECK: Even if the candidate's primary degree (course and branch) matches the post's general qualification requirements, if the "prerequisite" or "extraQualificationText" contains specific conditions like minimum marks/percentages (e.g., "60% marks"), specific subjects at school/other levels (e.g., "Mathematics at 12th standard"), or specific subjects not explicitly defined as the degree branch (e.g., "Statistics as one of the subjects"), you MUST generate a question for them unless the candidate's profile qualifications explicitly specify those exact details (including the minimum marks and the specific school/degree level subjects).
      11. AVOID DUPLICATES: Do NOT generate questions for requirements already mentioned in USER PROFILE, already answered in "screeningAnswers", or ALREADY ASKED in "existingQuestions".
      12. PHASED SCREENING: Generate a MAXIMUM of 5 questions. Focus on:
         a) Major academic gaps (e.g., if B.Ed is required but missing from profile).
         b) Specialized certifications (CCC, NCC, O-Level).
         c) Physical standards and work experience.
      13. Generate ONE separate question for EACH distinct specialized requirement.
      14. Do NOT merge or combine different requirements into a single question.
      15. Return a JSON array of objects with: "id", "text", "category", and "impactedPostCodes".
          The "impactedPostCodes" array MUST contain the exact string values from the "code" field of the MATCHED POST DETAILS list.
      16. RETURN ONLY THE JSON ARRAY. No explanation, no markdown.
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
        "model": model,
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

    if (questions.length === 0) {
      questions.push({
        id: "no_more_questions_info",
        text: "No more screening questions. All jobs requiring extra qualifications have been filtered.",
        category: "info",
        impactedPostNames: []
      });
    }

    return NextResponse.json({ questions });

  } catch (error: any) {
    console.error('[OpenRouter API Error]:', error.message);
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
