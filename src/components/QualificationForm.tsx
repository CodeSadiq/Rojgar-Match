'use client';

import React, { useState, useEffect } from 'react';
import { QUAL_TREE, QualNode } from '@/lib/constants';

// ── Icons ──────────────────────────────────────────
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

// ── Styles ─────────────────────────────────────────
const styles = `
  .expanded-form { max-width: 1000px; margin: 40px auto; padding: 20px; font-family: 'Inter', sans-serif; }
  .expanded-header { margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; }
  .expanded-header h1 { font-size: 32px; font-weight: 900; color: #fff; letter-spacing: -1px; }
  .expanded-header p { font-size: 15px; color: rgba(255,255,255,0.4); margin-top: 8px; }

  .level-section { 
    background: #0F172A; 
    border: 1px solid rgba(255,255,255,0.05); 
    border-radius: 24px; 
    padding: 32px; 
    margin-bottom: 24px; 
    transition: 0.3s;
  }
  .level-section:hover { border-color: rgba(59,130,246,0.3); }
  
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .section-title-wrap { display: flex; align-items: center; gap: 16px; }
  .section-icon { width: 44px; height: 44px; background: rgba(59,130,246,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .section-title { font-size: 20px; font-weight: 800; color: #fff; }
  .section-subtitle { font-size: 11px; color: rgba(59,130,246,0.5); font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }

  .qual-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .qual-chip { 
    background: rgba(255,255,255,0.02); 
    border: 2px solid rgba(255,255,255,0.05); 
    border-radius: 16px; 
    padding: 16px 20px; 
    cursor: pointer; 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    transition: 0.2s;
  }
  .qual-chip:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); }
  .qual-chip.selected { border-color: #3B82F6; background: rgba(59,130,246,0.1); }
  .qual-label { font-size: 14px; font-weight: 700; color: #fff; }
  .qual-stream { font-size: 10px; color: #3B82F6; font-weight: 800; margin-top: 2px; }

  .branch-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .branch-modal { background: #1E293B; width: 100%; max-width: 600px; border-radius: 24px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
  .branch-btn { width: 100%; text-align: left; padding: 14px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; color: #fff; font-weight: 600; margin-bottom: 8px; transition: 0.2s; }
  .branch-btn:hover { background: #3B82F6; color: #fff; }

  .save-bar { position: sticky; bottom: 24px; background: #3B82F6; color: #fff; padding: 20px 48px; border-radius: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 20px 50px rgba(59,130,246,0.4); margin-top: 40px; }
  .save-info { font-size: 14px; font-weight: 800; }
  .btn-finalize { background: #fff; color: #3B82F6; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.2s; }
  .btn-finalize:hover { transform: scale(1.05); }
`;

// ── Sections Definition ─────────────────────────────
const SECTIONS = [
  { id: 'S1', title: 'Matriculation (10th)', levels: [1] },
  { id: 'S2', title: 'Higher Secondary (12th)', levels: [2] },
  { id: 'S3', title: 'Diploma & ITI Certificates', levels: [3] },
  { id: 'S4', title: 'Graduation Degrees', levels: [4] },
  { id: 'S5', title: 'Post-Graduation (PG)', levels: [5] },
  { id: 'S6', title: 'Doctorate (PhD)', levels: [6] }
];

// ── Main Component ──────────────────────────────────
export default function QualificationForm() {
  const [registry, setRegistry] = useState<any[]>([]);
  const [showBranchesFor, setShowBranchesFor] = useState<QualNode | null>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);

    // Load existing profile from localStorage
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.qualifications) {
          setRegistry(parsed.qualifications);
        }
      } catch (e) {
        console.error('Error loading saved profile:', e);
      }
    }

    return () => { document.head.removeChild(el); };
  }, []);

  function handleQualClick(q: QualNode) {
    const isSelected = registry.some(r => r.name === q.name);
    if (isSelected) {
      setRegistry(prev => prev.filter(r => r.name !== q.name));
    } else {
      if (q.branches && q.branches.length > 1) {
        setShowBranchesFor(q);
      } else {
        const branch = (q.branches && q.branches.length === 1) ? q.branches[0].value : "any";
        addRecord(q.name, q.level, q.label, branch);
      }
    }
  }

  function addRecord(name: string, level: number, label: string, branch: string) {
    setRegistry(prev => [...prev.filter(r => r.name !== name), { name, level, label, branch }]);
    setShowBranchesFor(null);
  }

  function saveProfile() {
    const existing = localStorage.getItem('rojgarmatch_profile');
    let profile: any = { qualifications: registry };
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        profile = { ...parsed, qualifications: registry };
      } catch (e) { }
    }

    localStorage.setItem('rojgarmatch_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('rojgarmatch_auth_change'));
    alert("Full Registry Saved! Every level will now be matched separately. ✅");
    window.location.href = '/';
  }

  return (
    <div className="expanded-form">
      <header className="expanded-header">
        <h1>Educational Baseline Setup</h1>
        <p>Your entire academic career. Fill in every level you have completed.</p>
      </header>

      {SECTIONS.map(sec => {
        const quals = QUAL_TREE.filter(q => sec.levels.includes(q.level));
        return (
          <div key={sec.id} className="level-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <div>
                  <div className="section-subtitle">Academic Level 0{sec.levels[0]}</div>
                  <div className="section-title">{sec.title}</div>
                </div>
              </div>
            </div>

            <div className="qual-grid">
              {quals.map(q => {
                const rec = registry.find(r => r.name === q.name);
                return (
                  <div
                    key={q.name}
                    className={`qual-chip ${rec ? 'selected' : ''}`}
                    onClick={() => handleQualClick(q)}
                  >
                    <div>
                      <div className="qual-label">{q.label}</div>
                      {rec && rec.branch !== 'any' && <div className="qual-stream">{rec.branch}</div>}
                    </div>
                    {rec ? <IconCheck /> : <IconPlus />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="save-bar">
        <div className="save-info">
          {registry.length} LEVELS RECORDED IN REGISTRY
        </div>
        <button className="btn-finalize" onClick={saveProfile}>
          SAVE ALL QUALIFICATIONS ✓
        </button>
      </div>

      {showBranchesFor && (
        <div className="branch-overlay">
          <div className="branch-modal animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white mb-2">Specify Branch</h2>
            <p className="text-white/40 text-[10px] font-black uppercase mb-8 tracking-widest">{showBranchesFor.label}</p>

            <div className="max-h-[300px] overflow-y-auto pr-2">
              {showBranchesFor.branches.map(b => (
                <button
                  key={b.value}
                  className="branch-btn"
                  onClick={() => addRecord(showBranchesFor.name, showBranchesFor.level, showBranchesFor.label, b.value)}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <button
              className="w-full mt-6 py-4 text-white/40 font-bold hover:text-white transition-colors"
              onClick={() => setShowBranchesFor(null)}
            >
              Cancel Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
