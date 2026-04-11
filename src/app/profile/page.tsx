'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// ─── FULL DATA TREE ───────────────────
const QUAL_TREE = [
  { level: 1, name: "10th", label: "10th / Matriculation", branches: [] },
  {
    level: 2, name: "12th", label: "12th / Intermediate / HSC", branches: [
      { value: "Science (PCM)", label: "Science – PCM (Physics, Chemistry, Maths)" },
      { value: "Science (PCB)", label: "Science – PCB (Physics, Chemistry, Biology)" },
      { value: "Commerce", label: "Commerce" },
      { value: "Arts", label: "Arts / Humanities" },
      { value: "Vocational", label: "Vocational" },
    ]
  },
  {
    level: 3, name: "ITI", label: "ITI Certificate", branches: [
      { value: "Electrician", label: "Electrician" },
      { value: "Fitter", label: "Fitter" },
      { value: "Welder", label: "Welder" },
      { value: "Turner", label: "Turner" },
      { value: "Machinist", label: "Machinist" },
      { value: "Plumber", label: "Plumber" },
      { value: "Carpenter", label: "Carpenter" },
      { value: "Painter", label: "Painter" },
      { value: "Mason", label: "Mason" },
      { value: "Motor Mechanic", label: "Motor Mechanic" },
      { value: "Diesel Mechanic", label: "Diesel Mechanic" },
      { value: "Refrigeration and AC Mechanic", label: "Refrigeration & AC Mechanic" },
      { value: "Electronics Mechanic", label: "Electronics Mechanic" },
      { value: "Instrument Mechanic", label: "Instrument Mechanic" },
      { value: "COPA", label: "COPA (Computer Operator)" },
      { value: "Draughtsman Civil", label: "Draughtsman Civil" },
      { value: "Draughtsman Mechanical", label: "Draughtsman Mechanical" },
      { value: "Sheet Metal Worker", label: "Sheet Metal Worker" },
      { value: "Wireman", label: "Wireman" },
      { value: "Stenographer", label: "Stenographer" },
      { value: "Surveyor", label: "Surveyor" },
      { value: "Solar Technician", label: "Solar Technician" },
      { value: "Network Technician", label: "Network Technician" },
      { value: "Foundry Man", label: "Foundry Man" },
      { value: "Blacksmith", label: "Blacksmith" },
      { value: "Electroplater", label: "Electroplater" },
      { value: "Rubber Technician", label: "Rubber Technician" },
      { value: "Book Binder", label: "Book Binder" },
      { value: "Photographer", label: "Photographer" },
    ]
  },
  {
    level: 3, name: "Diploma", label: "Diploma / Polytechnic", branches: [
      { value: "CSE", label: "Computer Science & Engineering (CSE)" },
      { value: "IT", label: "Information Technology (IT)" },
      { value: "Mechanical", label: "Mechanical Engineering" },
      { value: "Civil", label: "Civil Engineering" },
      { value: "Electrical", label: "Electrical Engineering" },
      { value: "EEE", label: "Electrical & Electronics (EEE)" },
      { value: "ECE", label: "Electronics & Communication (ECE)" },
      { value: "Chemical", label: "Chemical Engineering" },
      { value: "Automobile", label: "Automobile Engineering" },
      { value: "Production", label: "Production Engineering" },
      { value: "Instrumentation", label: "Instrumentation Engineering" },
      { value: "Mining", label: "Mining Engineering" },
      { value: "Textile", label: "Textile Engineering" },
      { value: "Architecture", label: "Architecture" },
      { value: "Pharmacy", label: "Pharmacy (D.Pharm)" },
      { value: "Medical Lab Technology", label: "Medical Lab Technology (DMLT)" },
      { value: "Hotel Management", label: "Hotel Management" },
      { value: "Fashion Design", label: "Fashion Design" },
    ]
  },
  { level: 3, name: "GNM", label: "GNM (General Nursing & Midwifery)", branches: [] },
  { level: 3, name: "ANM", label: "ANM (Auxiliary Nurse Midwife)", branches: [] },
  { level: 3, name: "D.Pharm", label: "D.Pharm (Diploma in Pharmacy)", branches: [] },
  {
    level: 4, name: "B.Tech", label: "B.Tech / BE (Engineering)", branches: [
      { value: "CSE", label: "CSE" },
      { value: "IT", label: "IT" },
      { value: "Mechanical", label: "Mechanical" },
      { value: "Civil", label: "Civil" },
      { value: "Electrical", label: "Electrical" },
      { value: "EEE", label: "EEE" },
      { value: "ECE", label: "ECE" },
      { value: "Chemical", label: "Chemical" },
      { value: "Aerospace", label: "Aerospace" },
      { value: "Automobile", label: "Automobile" },
      { value: "Production", label: "Production" },
      { value: "Industrial", label: "Industrial" },
      { value: "Instrumentation", label: "Instrumentation" },
      { value: "Mining", label: "Mining" },
      { value: "Metallurgy", label: "Metallurgy" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Environmental Engineering", label: "Environmental Engineering" },
      { value: "Marine", label: "Marine" },
      { value: "Textile", label: "Textile" },
      { value: "AI", label: "AI / Artificial Intelligence" },
      { value: "Data Science", label: "Data Science" },
      { value: "Cyber Security", label: "Cyber Security" },
      { value: "Software Engineering", label: "Software Engineering" },
      { value: "Network Engineering", label: "Network Engineering" },
      { value: "VLSI", label: "VLSI" },
      { value: "Embedded Systems", label: "Embedded Systems" },
      { value: "Robotics", label: "Robotics" },
      { value: "Petroleum", label: "Petroleum" },
      { value: "Nuclear", label: "Nuclear" },
      { value: "Agricultural Engineering", label: "Agricultural Engineering" },
      { value: "Biomedical", label: "Biomedical" },
      { value: "Food Technology", label: "Food Technology" },
      { value: "Nanotechnology", label: "Nanotechnology" },
    ]
  },
  {
    level: 4, name: "B.Sc", label: "B.Sc (Science)", branches: [
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Mathematics", label: "Mathematics" },
      { value: "Statistics", label: "Statistics" },
      { value: "Biology", label: "Biology" },
      { value: "Zoology", label: "Zoology" },
      { value: "Botany", label: "Botany" },
      { value: "Microbiology", label: "Microbiology" },
      { value: "Biochemistry", label: "Biochemistry" },
      { value: "Environmental Science", label: "Environmental Science" },
      { value: "Geology", label: "Geology" },
      { value: "Geography", label: "Geography" },
      { value: "Computer Science", label: "Computer Science (B.Sc CS)" },
      { value: "Electronics", label: "Electronics (B.Sc)" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Forensic Science", label: "Forensic Science" },
      { value: "Agriculture", label: "Agriculture" },
      { value: "Nursing", label: "Nursing (B.Sc Nursing)" },
    ]
  },
  {
    level: 4, name: "BA", label: "BA (Arts / Humanities)", branches: [
      { value: "Economics", label: "Economics" },
      { value: "History", label: "History" },
      { value: "Political Science", label: "Political Science" },
      { value: "Sociology", label: "Sociology" },
      { value: "Psychology", label: "Psychology" },
      { value: "Public Administration", label: "Public Administration" },
      { value: "Social Work", label: "Social Work" },
      { value: "English", label: "English" },
      { value: "Hindi", label: "Hindi" },
      { value: "Sanskrit", label: "Sanskrit" },
      { value: "Urdu", label: "Urdu" },
      { value: "Bengali", label: "Bengali" },
      { value: "Tamil", label: "Tamil" },
      { value: "Telugu", label: "Telugu" },
      { value: "Marathi", label: "Marathi" },
      { value: "Kannada", label: "Kannada" },
      { value: "Malayalam", label: "Malayalam" },
      { value: "Odia", label: "Odia" },
      { value: "Punjabi", label: "Punjabi" },
      { value: "Gujarati", label: "Gujarati" },
      { value: "Journalism", label: "Journalism / Mass Communication" },
      { value: "Philosophy", label: "Philosophy" },
      { value: "Anthropology", label: "Anthropology" },
      { value: "Geography", label: "Geography" },
      { value: "International Relations", label: "International Relations" },
      { value: "Defence Studies", label: "Defence Studies" },
      { value: "Fine Arts", label: "Fine Arts" },
      { value: "Music", label: "Music" },
      { value: "Physical Education", label: "Physical Education" },
      { value: "Library Science", label: "Library Science" },
      { value: "Education", label: "Education" },
    ]
  },
  {
    level: 4, name: "B.Com", label: "B.Com (Commerce)", branches: [
      { value: "Accounting", label: "Accounting" },
      { value: "Finance", label: "Finance" },
      { value: "Banking", label: "Banking & Insurance" },
      { value: "Taxation", label: "Taxation" },
      { value: "Marketing", label: "Marketing" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "International Business", label: "International Business" },
    ]
  },
  { level: 4, name: "BCA", label: "BCA (Computer Applications)", branches: [{ value: "Computer Applications", label: "Computer Applications" }] },
  {
    level: 4, name: "BBA", label: "BBA / BBM (Business Administration)", branches: [
      { value: "Business Administration", label: "Business Administration" },
      { value: "Marketing", label: "Marketing" },
      { value: "Finance", label: "Finance" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "Operations", label: "Operations" },
      { value: "Hospital Management", label: "Hospital Management" },
      { value: "Aviation Management", label: "Aviation Management" },
      { value: "Hotel Management", label: "Hotel Management" },
    ]
  },
  { level: 4, name: "B.Pharm", label: "B.Pharm (Pharmacy)", branches: [{ value: "Pharmacy", label: "Pharmacy" }] },
  { level: 4, name: "MBBS", label: "MBBS (Medicine)", branches: [] },
  { level: 4, name: "BDS", label: "BDS (Dental Surgery)", branches: [] },
  { level: 4, name: "BAMS", label: "BAMS (Ayurvedic Medicine)", branches: [] },
  { level: 4, name: "BHMS", label: "BHMS (Homeopathic Medicine)", branches: [] },
  { level: 4, name: "BUMS", label: "BUMS (Unani Medicine)", branches: [] },
  { level: 4, name: "B.Sc Nursing", label: "B.Sc Nursing", branches: [{ value: "Nursing", label: "Nursing" }] },
  { level: 4, name: "LLB", label: "LLB / BA LLB (Law)", branches: [{ value: "Law", label: "Law" }] },
  { level: 4, name: "B.Ed", label: "B.Ed (Education)", branches: [{ value: "Education", label: "Education" }] },
  { level: 4, name: "B.Arch", label: "B.Arch (Architecture)", branches: [{ value: "Architecture", label: "Architecture" }] },
  { level: 4, name: "CA", label: "CA (Chartered Accountant)", branches: [{ value: "CA", label: "Chartered Accountancy" }] },
  { level: 4, name: "CS", label: "CS (Company Secretary)", branches: [{ value: "CS", label: "Company Secretaryship" }] },
  { level: 4, name: "CMA", label: "CMA / ICWA (Cost Accountant)", branches: [{ value: "CMA", label: "Cost Management Accountancy" }] },
  {
    level: 5, name: "M.Tech", label: "M.Tech / ME (Engineering PG)", branches: [
      { value: "CSE", label: "CSE" },
      { value: "IT", label: "IT" },
      { value: "Mechanical", label: "Mechanical" },
      { value: "Civil", label: "Civil" },
      { value: "Electrical", label: "Electrical" },
      { value: "ECE", label: "ECE" },
      { value: "Chemical", label: "Chemical" },
      { value: "Structural", label: "Structural Engineering" },
      { value: "AI", label: "AI / Machine Learning" },
      { value: "Data Science", label: "Data Science" },
      { value: "VLSI", label: "VLSI" },
      { value: "Embedded Systems", label: "Embedded Systems" },
    ]
  },
  {
    level: 5, name: "MBA", label: "MBA / PGDM (Management PG)", branches: [
      { value: "Business Administration", label: "General Management" },
      { value: "Finance", label: "Finance" },
      { value: "Marketing", label: "Marketing" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "Operations", label: "Operations" },
      { value: "Information Technology", label: "IT Management" },
      { value: "Hospital Management", label: "Hospital Management" },
      { value: "International Business", label: "International Business" },
    ]
  },
  {
    level: 5, name: "M.Sc", label: "M.Sc (Science PG)", branches: [
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Mathematics", label: "Mathematics" },
      { value: "Statistics", label: "Statistics" },
      { value: "Biology", label: "Biology" },
      { value: "Microbiology", label: "Microbiology" },
      { value: "Biochemistry", label: "Biochemistry" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Computer Science", label: "Computer Science" },
      { value: "Environmental Science", label: "Environmental Science" },
      { value: "Forensic Science", label: "Forensic Science" },
      { value: "Geology", label: "Geology" },
      { value: "Geography", label: "Geography" },
    ]
  },
  {
    level: 5, name: "MA", label: "MA (Arts / Humanities PG)", branches: [
      { value: "Economics", label: "Economics" },
      { value: "History", label: "History" },
      { value: "Political Science", label: "Political Science" },
      { value: "Sociology", label: "Sociology" },
      { value: "Psychology", label: "Psychology" },
      { value: "Public Administration", label: "Public Administration" },
      { value: "English", label: "English" },
      { value: "Hindi", label: "Hindi" },
      { value: "Journalism", label: "Journalism / Mass Communication" },
      { value: "Social Work", label: "Social Work" },
    ]
  },
  {
    level: 5, name: "M.Com", label: "M.Com (Commerce PG)", branches: [
      { value: "Accounting", label: "Accounting" },
      { value: "Finance", label: "Finance" },
      { value: "Taxation", label: "Taxation" },
    ]
  },
  { level: 5, name: "MCA", label: "MCA (Computer Applications PG)", branches: [{ value: "Computer Applications", label: "Computer Applications" }] },
  { level: 5, name: "LLM", label: "LLM (Law PG)", branches: [{ value: "Law PG", label: "Law" }] },
  { level: 5, name: "M.Ed", label: "M.Ed (Education PG)", branches: [{ value: "Education", label: "Education" }] },
  { level: 5, name: "M.Pharm", label: "M.Pharm (Pharmacy PG)", branches: [{ value: "M.Pharm", label: "Pharmacy" }] },
  { level: 5, name: "M.Arch", label: "M.Arch (Architecture PG)", branches: [{ value: "Architecture", label: "Architecture" }] },
  { level: 6, name: "PhD", label: "PhD / Doctorate", branches: [] },
];

const LEVEL_GROUPS = [
  { id: 1, label: "10th / Matriculation", levels: [1] },
  { id: 2, label: "12th / Intermediate", levels: [2] },
  { id: 3, label: "Diploma & ITI", levels: [3] },
  { id: 4, label: "Graduation (Bachelor's)", levels: [4] },
  { id: 5, label: "Post-Graduation (Master's)", levels: [5] },
  { id: 6, label: "PhD / Research", levels: [6] },
];

export default function ProfilePage() {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<Record<number, { qual: string, branch: string }>>({});
  const [completed, setCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({ fullName: '', email: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('govrecruit_auth');
    if (!isAuth) {
      router.push('/login');
      return;
    }

    const authData = JSON.parse(isAuth);
    setUserProfile({ fullName: authData.fullName, email: authData.email });

    const saved = localStorage.getItem('govrecruit_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserProfile((prev: any) => ({ ...prev, ...parsed }));
      if (parsed.dob) setDob(parsed.dob);
      
      if (parsed.qualifications && Array.isArray(parsed.qualifications)) {
        const initialState: Record<number, { qual: string, branch: string }> = {};
        parsed.qualifications.forEach((q: any) => {
          initialState[q.level] = { qual: q.name, branch: q.branch };
        });
        setSelectedLevels(initialState);
      }
      setCompleted(true);
    }
    setIsLoaded(true);
  }, [router]);

  const handleLevelQualChange = (levelId: number, qualName: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [levelId]: { qual: qualName, branch: '' }
    }));
  };

  const handleLevelBranchChange = (levelId: number, branchValue: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [levelId]: { ...prev[levelId], branch: branchValue }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Collect all selected levels into the qualifications array
      const qualifications = Object.entries(selectedLevels)
        .filter(([_, data]) => data.qual !== "")
        .map(([levelId, data]) => {
          const qualNode = QUAL_TREE.find(q => q.name === data.qual);
          return {
            name: data.qual,
            level: parseInt(levelId),
            label: qualNode?.label || data.qual,
            branch: data.branch
          };
        });

      const profileData = {
        dob,
        qualifications
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email, profile: profileData }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      const fullProfile = { ...userProfile, ...profileData };
      localStorage.setItem('govrecruit_profile', JSON.stringify(fullProfile));
      window.dispatchEvent(new Event('govrecruit_auth_change'));
      setCompleted(true);
      alert('Full Multi-Level Profile Saved Successfully! ✅');
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    router.push('/login');
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">

      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
        <div className="max-w-[1100px] mx-auto space-y-12 animate-in fade-in duration-700">

          <div className="bg-white border border-gray-200 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-8 shadow-sm text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-5">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">{userProfile.fullName || 'Citizen Profile'}</h1>
                <p className="text-gray-400 text-sm md:text-base font-medium">{userProfile.email}</p>
              </div>

              {completed ? (
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                  Qualification Recorded
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                  Qualification Not Recorded
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="px-8 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-red-100"
            >
              Logout ⎆
            </button>
          </div>

          <div className="max-w-[1100px]">
            <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-10 shadow-sm space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-navy">Set Qualification</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Update your qualifications to see eligible jobs.</p>
              </div>

              <div className="space-y-8">
                {LEVEL_GROUPS.map((group) => {
                  const levelState = selectedLevels[group.id] || { qual: '', branch: '' };
                  const qualsForLevel = QUAL_TREE.filter(q => group.levels.includes(q.level));
                  const currentQual = QUAL_TREE.find(q => q.name === levelState.qual);

                  return (
                    <div key={group.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.label}</label>
                        <select
                          value={levelState.qual}
                          onChange={(e) => handleLevelQualChange(group.id, e.target.value)}
                          className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${
                            levelState.qual 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                          }`}
                        >
                          <option value="">-- No Record --</option>
                          {qualsForLevel.map(q => (
                            <option key={q.name} value={q.name}>{q.label}</option>
                          ))}
                        </select>
                      </div>

                      {currentQual && currentQual.branches.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {group.id <= 2 ? "Academic Stream" : 
                             group.id === 3 ? "Trade Branch" : 
                             "Professional Branch"}
                          </label>
                          <select
                            value={levelState.branch}
                            onChange={(e) => handleLevelBranchChange(group.id, e.target.value)}
                            className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${
                              levelState.branch 
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                            }`}
                          >
                            <option value="">-- No Record --</option>
                            {currentQual.branches.map(b => (
                              <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-6 border-t border-gray-100">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${
                            dob 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                          }`}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          disabled={isSaving || !dob}
                          className="flex-1 h-12 bg-navy text-white font-bold text-[11px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30"
                        >
                          {isSaving ? 'Saving...' : 'Save Qualification'}
                        </button>
                        
                        <button
                          onClick={() => {
                             if(confirm('Clear all settings?')) {
                               setSelectedLevels({});
                               setDob('');
                               localStorage.removeItem('govrecruit_profile');
                               window.location.reload();
                             }
                          }}
                          className="px-6 h-12 bg-transparent text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        >
                          Reset
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
