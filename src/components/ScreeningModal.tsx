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
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  // Auto-scroll logic for phased questions
  useEffect(() => {
    if (isLoading) {
      // Keep track of count before loading
      lastCountRef.current = questions.length;
    } else {
      // 2. When loading ends, scroll to the NEW first question (at the top)
      if (questions.length > lastCountRef.current && lastCountRef.current > 0) {
        setTimeout(() => {
          topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
      lastCountRef.current = questions.length;
    }
  }, [isLoading, questions.length]);

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

    // 🛡️ Mitigation: 2MB file size limit
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      alert('File is too large. Please upload a PDF smaller than 2MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="AI Screening">
      {/* Backdrop: Full Screen Fade */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Panel Container: Centered with Padding */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10 pointer-events-none">
        <div className="relative w-full md:max-w-2xl lg:max-w-3xl mx-auto max-h-[85vh] md:max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl shadow-navy/30 animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="flex-shrink-0 bg-[#0D244D] px-4 md:px-8 py-4 md:py-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
                </svg>
                <div>
                  <h2 className="text-[14px] md:text-lg font-bold text-white leading-tight">
                    Filter more with AI
                  </h2>
                  <p className="hidden md:block text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">
                    {step === 'selection'
                      ? 'Select how you want to filter jobs matched on course and branch'
                      : step === 'textInput'
                        ? 'The AI will filter jobs based on your details'
                        : step === 'resumeUpload'
                          ? 'Extract details automatically from PDF'
                          : 'Answer to filter jobs more precisely'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {step !== 'selection' && !isLoading && (
                  <button
                    onClick={() => setStep('selection')}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all active:scale-95"
                  >
                    Switch Mode
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all active:scale-90"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>

            {step === 'questions' && !isLoading && totalCount > 0 && (
              <div className="mt-1 md:mt-4 relative z-10">
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

          <div className="flex-1 overflow-y-auto overscroll-contain modal-scroll-container">
            {isUploading || (isLoading && questions.length === 0) ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-5 text-center px-8">
                <div className="w-12 h-12 border-4 border-navy/10 border-t-navy rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-navy/40 animate-pulse">
                  {isUploading ? 'Parsing Resume Details...' : 'AI is processing your request...'}
                </p>
              </div>
            ) : step === 'selection' ? (
              <div className="p-4 md:p-8 flex flex-col gap-3 md:gap-5">
                <button
                  onClick={() => setStep('textInput')}
                  className="group flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white border-2 border-gray-200 hover:border-navy rounded-2xl hover:shadow-lg hover:shadow-navy/5 transition-all text-left animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] md:text-[17px] font-extrabold text-navy mb-1 leading-snug">Write everything about your qualification</h4>
                    <p className="text-[11px] md:text-[13px] text-navy/50 font-semibold leading-relaxed">Explain your skills, experience and degrees in your own words.</p>
                  </div>
                </button>

                {false && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex items-center gap-3 md:gap-5 p-3.5 md:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-navy hover:shadow-xl hover:shadow-navy/5 transition-all text-left"
                  >
                    <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[13px] md:text-[15px] font-bold text-navy mb-0.5 md:mb-1 leading-tight">Upload Resume (AI Analysis)</h4>
                      <p className="text-[10px] md:text-[12px] text-navy/40 font-medium leading-relaxed">Automatically extract details from your PDF resume for filtering.</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
                  </button>
                )}

                <button
                  onClick={() => { onGenerateQuestions(); setStep('questions'); }}
                  className="group flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white border-2 border-gray-200 hover:border-navy rounded-2xl hover:shadow-lg hover:shadow-navy/5 transition-all text-left animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-[14px] md:text-[17px] font-extrabold text-navy leading-snug">Generate screening questions</h4>
                      <span className="text-[#166534] text-[10px] md:text-[11px] font-black uppercase tracking-widest ml-1">[Recommended]</span>
                    </div>
                    <p className="text-[11px] md:text-[13px] text-navy/50 font-semibold leading-relaxed">Answer simple Yes/No questions based on job requirements.</p>
                  </div>
                </button>
              </div>
            ) : step === 'textInput' ? (
              <div className="p-3 md:p-10 space-y-5 md:space-y-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-navy ml-1">Your Qualifications & Details</label>
                  <div className="relative group">
                    <textarea
                      value={qualificationText}
                      onChange={(e) => setQualificationText(e.target.value)}
                      placeholder="Example: Maine 12th science se pass kiya hai 80% marks ke saath. Mere paas CCC certificate bhi hai..."
                      className="w-full h-40 md:h-64 p-4 md:p-6 rounded-xl border-2 border-gray-200 focus:border-navy focus:ring-8 focus:ring-navy/5 text-[15px] md:text-[16px] font-bold text-navy placeholder:text-navy/30 leading-relaxed resize-none bg-white transition-all shadow-sm"
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

                <div className="flex items-center gap-2 md:gap-4 pt-2">
                  <button
                    onClick={() => setStep('selection')}
                    className="flex-1 py-4 md:py-5 bg-gray-100 text-navy/60 rounded-xl text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] transition-all hover:bg-gray-200 active:scale-[0.98] flex items-center justify-center whitespace-nowrap"
                  >
                    Go Back
                  </button>

                  <button
                    onClick={() => handleTextSubmit()}
                    disabled={isSubmittingText || !qualificationText.trim()}
                    className="flex-1 py-4 md:py-5 bg-navy text-white rounded-xl text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-navy/20 hover:bg-[#06142E] hover:shadow-navy/40 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                    {isSubmittingText ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Filter Now</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 md:px-8 py-3 md:py-6 space-y-2 md:space-y-3">
                {questions.length === 0 && !isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center px-8">
                    <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-navy">Screening Complete</h3>
                    <p className="text-[12px] text-navy/40 font-medium max-w-[280px]">
                      No more screening questions found for your matched jobs. You can close this modal and browse the jobs.
                    </p>
                  </div>
                ) : (
                  <>
                    <div ref={topRef} />

                    {questions.map((q, idx) => {
                      const currentAnswer = answers[q.id];
                      const isAnswered = currentAnswer !== undefined;
                      const isInfo = q.category === 'info';
                      return (
                        <div
                          key={q.id}
                          id={`q-container-${q.id}`}
                          className={`flex flex-col gap-2.5 md:gap-4 p-3.5 md:p-7 rounded-xl border-2 transition-all duration-300 ${isInfo ? 'bg-green-50/20 border-green-100 shadow-sm' : isAnswered ? 'bg-gray-50/50 border-gray-100 opacity-70' : 'bg-white border-gray-100 shadow-sm hover:border-navy/10 hover:shadow-xl hover:shadow-navy/5'} ${idx > 0 ? 'mt-2 md:mt-3' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            {isInfo ? (
                              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-green-600 text-white text-[12px] font-black flex items-center justify-center mt-0.5 shadow-md shadow-green-600/20">✓</span>
                            ) : (
                              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-navy text-white text-[10px] font-black flex items-center justify-center mt-0.5 shadow-md shadow-navy/10">{idx + 1}</span>
                            )}
                            <p className="text-[12px] md:text-[15px] font-bold text-navy leading-relaxed flex-1">{q.text}</p>
                          </div>
                          {!isInfo && (
                            <div className="flex flex-row items-center gap-2 pl-0 md:pl-12">
                              <button
                                onClick={() => onAnswer(q.id, true)}
                                className={`flex-1 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border ${currentAnswer === true ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100' : 'bg-white border-gray-200 text-green-600 hover:bg-green-50'}`}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => onAnswer(q.id, false)}
                                className={`flex-1 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border ${currentAnswer === false ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100' : 'bg-white border-gray-200 text-red-600 hover:bg-red-50'}`}
                              >
                                No
                              </button>
                              <button
                                onClick={() => onAnswer(q.id, null)}
                                className={`flex-1 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border ${currentAnswer === null ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100' : 'bg-white border-gray-200 text-orange-600 hover:bg-orange-50'}`}
                              >
                                Not Sure
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Inline Loading State for Next Phase (NOW AT BOTTOM) */}
                    {isLoading && questions.length > 0 && (
                      <div className="flex flex-col gap-4 p-7 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 animate-pulse mt-4">
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-lg bg-navy/10" />
                          <div className="h-4 bg-navy/10 rounded-full w-3/4" />
                        </div>
                        <div className="flex gap-2 pl-12">
                          <div className="h-10 bg-white border border-gray-100 rounded-xl flex-1" />
                          <div className="h-10 bg-white border border-gray-100 rounded-xl flex-1" />
                          <div className="h-10 bg-white border border-gray-100 rounded-xl flex-1" />
                        </div>
                        <p className="text-[10px] font-bold text-navy/20 uppercase tracking-widest text-center mt-2">AI is analyzing next requirements...</p>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>
            )}
          </div>

          {((step === 'questions' && (answeredCount > 0 || questions.some(q => q.category === 'info'))) || hasTextFilter) && (
            <div className="flex-shrink-0 border-t border-gray-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between bg-white/90 backdrop-blur-sm">
              <div className="flex flex-col gap-0.5">
                <button onClick={onClearAll} className="text-[9px] font-black text-red-500/40 hover:text-red-600 uppercase tracking-widest transition-colors text-left">Clear & Reset</button>
              </div>

              {step === 'questions' && answeredCount > 0 && (
                <button
                  onClick={onGenerateQuestions}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-navy text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-navy/10 hover:bg-[#06142E] transition-all active:scale-95 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                  )}
                  <span>Filter & Next Phase</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
