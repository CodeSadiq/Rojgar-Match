'use client';

import { useEffect } from 'react';
import { getEligibleJobs } from '@/lib/matching';

export default function JobMatchHighlighter({ job }: { job: any }) {
  useEffect(() => {
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
    const savedAnswers = localStorage.getItem('rojgarmatch_screening_answers');
    const savedQuestions = localStorage.getItem('rojgarmatch_screening_questions');
    
    if (!savedProfile) return;

    try {
      const profile = JSON.parse(savedProfile);
      const answers = savedAnswers ? JSON.parse(savedAnswers) : {};
      const questions = savedQuestions ? JSON.parse(savedQuestions) : [];

      // 1. Base matches (Stage 1 - Local Degree Match)
      const matches = getEligibleJobs(profile, [job]);
      const baseMatchedNames = (matches.length > 0 && matches[0].matchedPosts) 
        ? matches[0].matchedPosts.map((p: any) => p.name.toLowerCase().trim())
        : [];

      // 2. Identify posts invalidated by AI screening (Stage 2)
      // If a user answered "No" to a question, find which posts it impacts
      const ineligiblePostNames = new Set<string>();
      
      questions.forEach((q: any) => {
        // If the user answered "No" (false) to this question
        if (answers[q.id] === false) {
          if (Array.isArray(q.impactedPostNames)) {
            q.impactedPostNames.forEach((name: string) => {
              ineligiblePostNames.add(name.toLowerCase().trim());
            });
          }
        }
      });

      // 3. Update UI
      const rows = document.querySelectorAll('tr[data-post-name]');
      
      rows.forEach(row => {
        const rawName = row.getAttribute('data-post-name');
        const postName = rawName?.toLowerCase().trim();
        const badge = row.querySelector('.match-badge') as HTMLElement;
        
        if (badge && postName) {
          // A post is truly matched ONLY if it passed Stage 1 AND is not invalidated by Stage 2
          const isBaseMatch = baseMatchedNames.includes(postName);
          const isInvalidatedByAI = ineligiblePostNames.has(postName);

          if (isBaseMatch && !isInvalidatedByAI) {
            badge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
          }
        }
      });
      
    } catch (e) {
      console.error('Highlighting Error:', e);
    }
  }, [job]);

  return null;
}
