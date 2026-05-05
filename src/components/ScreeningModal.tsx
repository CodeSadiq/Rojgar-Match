'use client';

import React, { useEffect, useState, useRef } from 'react';

interface ScreeningQuestion {
  id: string;
  text: string;
  category?: string;
  impactedPostNames?: string[];
}

interface ScreeningModalProps {
  isOpen: boolean;
  isLoading: boolean;
  questions: ScreeningQuestion[];
  answers: Record<string, boolean | null>;
  onAnswer: (questionId: string, answer: boolean | null) => void;
  onClose: () => void;
  onClearAll: () => void;
  onGenerateQuestions: () => void;
  onFilterByText: (text: string) => Promise<void>;
  hasTextFilter?: boolean;
}

export default function ScreeningModal({
  isOpen,
  isLoading,
  questions,
  answers,
  onAnswer,
  onClose,
  onClearAll,
  onGenerateQuestions,
  onFilterByText,
  hasTextFilter = false,
}: ScreeningModalProps) {
  const [step, setStep] = useState<'selection' | 'textInput' | 'questions' | 'resumeUpload'>('selection');
  const [qualificationText, setQualificationText] = useState('');
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      if (questions.length > 0) {
        setStep('questions');
      } else {
        setStep('selection');
      }
    }
  }, [isOpen, questions.length]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const handleTextSubmit = async (textToUse?: string) => {
    const finalText = textToUse || qualificationText;
    if (!finalText.trim()) return;
    setIsSubmittingText(true);
    try {
      await onFilterByText(finalText);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingText(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }
      
      const data = await res.json();
      
      if (data.text) {
        setQualificationText(data.text.substring(0, 5000));
        setStep('textInput');
      }
    } catch (error: any) {
      console.error('Resume Parse Error:', error);
      alert(`Failed to parse resume: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="AI Screening"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full md:max-w-2xl lg:max-w-3xl mx-0 md:mx-4 max-h-[92dvh] md:max-h-[88vh] flex flex-col bg-white rounded-t-3xl md:rounded-2xl shadow-2xl shadow-navy/20 animate-in slide-in-from-bottom md:slide-in-from-bottom-4 duration-300 overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 bg-navy px-6 md:px-8 py-5 md:py-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] md:text-lg font-bold text-white leading-tight">
                  {step === 'selection' ? 'Choose AI Filter Mode' : step === 'textInput' ? 'Describe Your Qualification' : step === 'resumeUpload' ? 'Upload Your Resume' : 'AI Screening Questions'}
                </h2>
                <p className="text-[10px] md:text-[11px] font-semibold text-white/50 uppercase tracking-widest mt-0.5">
                  {step === 'selection' ? 'Select how you want to filter jobs' : step === 'textInput' ? 'The AI will filter jobs based on your details' : step === 'resumeUpload' ? 'Extract details automatically from PDF' : 'Answer to filter jobs more precisely'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {step !== 'selection' && !isLoading && (
                <button
                  onClick={() => setStep('selection')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all active:scale-95"
                >
                  Switch Mode
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all active:scale-90"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          </div>

          {step === 'questions' && !isLoading && totalCount > 0 && (
            <div className="mt-4 relative z-10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Progress</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{answeredCount}/{totalCount}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/50 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading || isUploading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-5 text-center px-8">
              <div className="w-12 h-12 border-4 border-navy/10 border-t-navy rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-navy/40 animate-pulse">
                {isUploading ? 'Parsing Resume Details...' : 'AI is processing your request...'}
              </p>
            </div>
          ) : step === 'selection' ? (
            <div className="p-6 md:p-10 flex flex-col gap-4">
              <button
                onClick={() => setStep('textInput')}
                className="group flex items-center gap-5 p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-navy hover:shadow-xl hover:shadow-navy/5 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-navy mb-1">Write everything about your qualification</h4>
                  <p className="text-[12px] text-navy/40 font-medium">Explain your skills, experience and degrees in your own words.</p>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="group flex items-center gap-5 p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-navy hover:shadow-xl hover:shadow-navy/5 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-navy mb-1">Upload Resume (AI Analysis)</h4>
                  <p className="text-[12px] text-navy/40 font-medium">Automatically extract details from your PDF resume for filtering.</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
              </button>

              <button
                onClick={() => { onGenerateQuestions(); setStep('questions'); }}
                className="group flex items-center gap-5 p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-navy hover:shadow-xl hover:shadow-navy/5 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-[15px] font-bold text-navy">Generate screening questions</h4>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest rounded-md border border-green-100">Recommended</span>
                  </div>
                  <p className="text-[12px] text-navy/40 font-medium">Answer simple Yes/No questions based on job requirements.</p>
                </div>
              </button>
            </div>
          ) : step === 'textInput' ? (
            <div className="p-6 md:p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy ml-1">Your Qualifications & Details</label>
                <div className="relative group">
                  <textarea
                    value={qualificationText}
                    onChange={(e) => setQualificationText(e.target.value)}
                    placeholder="Example: Maine 12th science se pass kiya hai 80% marks ke saath. Mere paas CCC certificate bhi hai..."
                    className="w-full h-48 md:h-64 p-6 rounded-2xl border-2 border-gray-200 focus:border-navy focus:ring-8 focus:ring-navy/5 text-[16px] font-bold text-navy placeholder:text-navy/30 leading-relaxed resize-none bg-white transition-all shadow-sm"
                  />
                  <div className="absolute bottom-4 right-4 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-navy/20 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-navy/20 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-navy/20 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-navy/50 italic ml-1">
                  * You can write in English, Hindi, or Hinglish (e.g. "Maine B.A kiya hai")
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={() => handleTextSubmit()}
                  disabled={isSubmittingText || !qualificationText.trim()}
                  className="w-full py-5 bg-navy text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-navy/20 hover:bg-[#06142E] hover:shadow-navy/40 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  
                  {isSubmittingText ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Filter Jobs Now</span>
                      <svg className="group-hover:translate-x-1.5 transition-transform duration-300" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => setStep('selection')}
                  className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-navy/40 hover:text-navy transition-all group/back"
                >
                  <svg className="group-hover/back:-translate-x-1 transition-transform duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 md:px-8 py-5 md:py-6 space-y-3">
              {questions.map((q, idx) => {
                const currentAnswer = answers[q.id];
                const isAnswered = currentAnswer !== undefined;
                return (
                  <div key={q.id} className={`flex flex-col gap-3 p-4 md:p-5 rounded-xl border transition-all duration-300 ${isAnswered ? 'bg-gray-50/60 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm hover:border-navy/20 hover:shadow-md'}`}>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-navy text-white text-[11px] font-bold flex items-center justify-center mt-0.5 shadow-sm">{idx + 1}</span>
                      <p className="text-[13px] md:text-[14px] font-bold text-gray-900 leading-snug flex-1">{q.text}</p>
                    </div>
                    <div className="flex items-center gap-2 pl-9">
                      <button onClick={() => onAnswer(q.id, true)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentAnswer === true ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300 text-black'}`}>✓ Yes</button>
                      <button onClick={() => onAnswer(q.id, false)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentAnswer === false ? 'bg-red-600 text-white' : 'bg-white border-2 border-gray-300 text-black'}`}>✕ No</button>
                      <button onClick={() => onAnswer(q.id, null)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${currentAnswer === null ? 'bg-orange-500 text-white' : 'bg-white border-2 border-gray-300 text-black'}`}>~ Not Sure</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {((step === 'questions' && answeredCount > 0) || hasTextFilter) && (
          <div className="flex-shrink-0 border-t border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between bg-white/90 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-navy/30 uppercase tracking-widest">AI Filter Active</p>
            <button onClick={onClearAll} className="text-[10px] font-black text-navy/30 hover:text-red-600 uppercase tracking-widest transition-colors">Clear & Reset</button>
          </div>
        )}
      </div>
    </div>
  );
}
