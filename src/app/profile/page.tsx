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
      { value: "any", label: "Any Stream" },
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
      { value: "any", label: "Any / Relevant Branch" },
    ]
  },
  { level: 3, name: "GNM", label: "GNM (General Nursing & Midwifery)", branches: [] },
  { level: 3, name: "ANM", label: "ANM (Auxiliary Nurse Midwife)", branches: [] },
  { level: 3, name: "D.Pharm", label: "D.Pharm (Diploma in Pharmacy)", branches: [] },
  { level: 4, name: "Graduate", label: "Graduate – Any Degree", branches: [{ value: "any", label: "Any Discipline" }] },
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
      { value: "any", label: "Any / Relevant Branch" },
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
      { value: "any", label: "Any Science Subject" },
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
      { value: "any", label: "Any Arts Subject" },
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
      { value: "any", label: "Any Commerce Subject" },
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
      { value: "any", label: "Any Specialisation" },
    ]
  },
  { level: 4, name: "B.Pharm", label: "B.Pharm (Pharmacy)", branches: [{ value: "Pharmacy", label: "Pharmacy" }] },
  { level: 4, name: "MBBS", label: "MBBS (Medicine)", branches: [{ value: "any", label: "Medicine" }] },
  { level: 4, name: "BDS", label: "BDS (Dental Surgery)", branches: [{ value: "any", label: "Dental" }] },
  { level: 4, name: "BAMS", label: "BAMS (Ayurvedic Medicine)", branches: [{ value: "any", label: "Ayurveda" }] },
  { level: 4, name: "BHMS", label: "BHMS (Homeopathic Medicine)", branches: [{ value: "any", label: "Homeopathy" }] },
  { level: 4, name: "BUMS", label: "BUMS (Unani Medicine)", branches: [{ value: "any", label: "Unani" }] },
  { level: 4, name: "B.Sc Nursing", label: "B.Sc Nursing", branches: [{ value: "Nursing", label: "Nursing" }] },
  { level: 4, name: "LLB", label: "LLB / BA LLB (Law)", branches: [{ value: "Law", label: "Law" }] },
  { level: 4, name: "B.Ed", label: "B.Ed (Education)", branches: [{ value: "Education", label: "Education" }] },
  { level: 4, name: "B.Arch", label: "B.Arch (Architecture)", branches: [{ value: "Architecture", label: "Architecture" }] },
  { level: 4, name: "CA", label: "CA (Chartered Accountant)", branches: [{ value: "CA", label: "Chartered Accountancy" }] },
  { level: 4, name: "CS", label: "CS (Company Secretary)", branches: [{ value: "CS", label: "Company Secretaryship" }] },
  { level: 4, name: "CMA", label: "CMA / ICWA (Cost Accountant)", branches: [{ value: "CMA", label: "Cost Management Accountancy" }] },
  { level: 5, name: "Post Graduate", label: "Post Graduate – Any Master's", branches: [{ value: "any", label: "Any Discipline" }] },
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
      { value: "any", label: "Any Branch" },
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
      { value: "any", label: "Any Specialisation" },
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
      { value: "any", label: "Any Science Subject" },
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
      { value: "any", label: "Any Arts Subject" },
    ]
  },
  {
    level: 5, name: "M.Com", label: "M.Com (Commerce PG)", branches: [
      { value: "Accounting", label: "Accounting" },
      { value: "Finance", label: "Finance" },
      { value: "Taxation", label: "Taxation" },
      { value: "any", label: "Any Commerce Subject" },
    ]
  },
  { level: 5, name: "MCA", label: "MCA (Computer Applications PG)", branches: [{ value: "Computer Applications", label: "Computer Applications" }] },
  { level: 5, name: "LLM", label: "LLM (Law PG)", branches: [{ value: "Law PG", label: "Law" }] },
  { level: 5, name: "M.Ed", label: "M.Ed (Education PG)", branches: [{ value: "Education", label: "Education" }] },
  { level: 5, name: "M.Pharm", label: "M.Pharm (Pharmacy PG)", branches: [{ value: "M.Pharm", label: "Pharmacy" }] },
  { level: 5, name: "M.Arch", label: "M.Arch (Architecture PG)", branches: [{ value: "Architecture", label: "Architecture" }] },
  { level: 6, name: "PhD", label: "PhD / Doctorate", branches: [{ value: "any", label: "Any Discipline" }] },
];

const LEVEL_GROUPS = [
  { label: "School Level", levels: [1, 2] },
  { label: "Diploma / Certificate Level", levels: [3] },
  { label: "Graduation Level", levels: [4] },
  { label: "Post Graduation Level", levels: [5] },
  { label: "Doctorate Level", levels: [6] },
];

export default function ProfilePage() {
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [selectedQual, setSelectedQual] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
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

    // Load AUTH data first (always present if logged in)
    const authData = JSON.parse(isAuth);
    setUserProfile({ fullName: authData.fullName, email: authData.email });

    // Overlay PROFILE data if it exists
    const saved = localStorage.getItem('govrecruit_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserProfile((prev: any) => ({ ...prev, ...parsed }));
      if (parsed.qualification) {
        const qual = QUAL_TREE.find(q => q.name === parsed.qualification);
        if (qual) {
          setSelectedQual(qual);
          const branch = qual.branches.find(b => b.value === parsed.branch);
          if (branch) setSelectedBranch(branch);
        }
      }
      if (parsed.dob) {
        setDob(parsed.dob);
        setCompleted(true);
      }
    }
    setIsLoaded(true);
  }, [router]);

  const handleQualChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qual = QUAL_TREE.find(q => q.name === e.target.value);
    setSelectedQual(qual || null);
    setSelectedBranch(null);
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branch = selectedQual?.branches.find((b: any) => b.value === e.target.value);
    setSelectedBranch(branch || null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileData = {
        dob,
        qualification: selectedQual.name,
        level: selectedQual.level,
        branch: selectedBranch?.value || 'any'
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email, profile: profileData }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      const fullProfile = { ...userProfile, ...profileData };
      localStorage.setItem('govrecruit_profile', JSON.stringify(fullProfile));
      setCompleted(true);
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">

      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10">
        <div className="max-w-[1000px] mx-auto space-y-12 animate-in fade-in duration-700">

          {/* IDENTITY SECTION - PREMIUM PROFILE CARD */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-navy/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="relative z-10 flex flex-col gap-5">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 mb-1">Profile</div>
                <h1 className="text-3xl md:text-5xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                  {userProfile.fullName || 'Citizen Profile'}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                  <svg className="w-4 h-4 text-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <p className="text-sm font-bold text-navy/60">
                    {userProfile.email}
                  </p>
                </div>

                {completed && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Qualification Verified
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10">
              <button
                onClick={handleLogout}
                className="group/btn flex items-center gap-3 px-8 py-4 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all rounded-xl shadow-lg shadow-red-500/5 active:scale-95"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout</span>
                <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>

          {/* SIMPLIFIED FORM SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 max-w-[600px]">

            <section className="space-y-10 pb-20">

              {/* ACADEMICS */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-navy">Education Details</h2>
                  <p className="text-xs text-gray-400 font-medium">Specify your highest level of accredited academic qualification.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Education Level</label>
                    <div className="relative">
                      <select
                        value={selectedQual?.name || ''}
                        onChange={handleQualChange}
                        className="w-full h-14 bg-white border border-gray-200 px-5 text-sm font-semibold text-navy appearance-none outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all rounded-xl shadow-sm"
                      >
                        <option value="" disabled>Select Level</option>
                        {LEVEL_GROUPS.map((group, idx) => (
                          <optgroup key={idx} label={group.label}>
                            {QUAL_TREE.filter(q => group.levels.includes(q.level)).map((qual, qIdx) => (
                              <option key={qIdx} value={qual.name}>{qual.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs">▼</div>
                    </div>
                  </div>

                  {selectedQual && selectedQual.branches.length > 0 && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-400">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Specialization Branch</label>
                      <div className="relative">
                        <select
                          value={selectedBranch?.value || ''}
                          onChange={handleBranchChange}
                          className="w-full h-14 bg-white border border-gray-200 px-5 text-sm font-semibold text-navy appearance-none outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all rounded-xl shadow-sm"
                        >
                          <option value="" disabled>Select Branch</option>
                          {selectedQual.branches.map((br: any, bIdx: number) => (
                            <option key={bIdx} value={br.value}>{br.label}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs">▼</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PERSONAL */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-navy">Identity Verification</h2>
                  <p className="text-xs text-gray-400 font-medium">Enter your date of birth as recorded in your official documents.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-14 bg-white border border-gray-200 px-5 text-sm font-semibold text-navy outline-none focus:border-navy transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-navy/5"
                  />
                </div>
              </div>

              {/* SAVE & RESET */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !dob || !selectedQual || (selectedQual.branches.length > 0 && !selectedBranch)}
                  className="w-full h-14 bg-navy text-white font-bold text-sm tracking-wide shadow-lg shadow-navy/10 hover:bg-[#06142E] disabled:opacity-20 transition-all rounded-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Establish Profile Baseline</>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Clear all education and identity details? This will reset your profile baseline.')) {
                      setDob('');
                      setSelectedQual(null);
                      setSelectedBranch(null);
                      setCompleted(false);
                      localStorage.removeItem('govrecruit_profile');
                      alert('Baseline Cleared.');
                    }
                  }}
                  className="w-full h-14 bg-white border border-red-200 text-red-500 font-bold text-sm tracking-wide hover:bg-red-50 transition-all rounded-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Clear Selection
                </button>
              </div>

            </section>
          </div>

          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-10">
            GovRecruit Verification System — Baseline Protocol
          </p>
        </div>
      </main>
    </div>
  );
}
