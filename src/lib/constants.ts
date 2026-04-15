export interface QualNode {
  level: number;
  name: string;
  label: string;
  branches: { value: string; label: string }[];
}

export const QUAL_TREE: QualNode[] = [

  // ─────────────────────────────────────────────
  // LEVEL 1 — 10th / Matriculation
  // ─────────────────────────────────────────────
  { level: 1, name: "10th", label: "10th / Matriculation", branches: [] },

  // ─────────────────────────────────────────────
  // LEVEL 2 — 12th / Intermediate
  // ─────────────────────────────────────────────
  {
    level: 2, name: "12th", label: "12th / Intermediate / HSC", branches: [
      { value: "Science (PCM)", label: "Science – PCM (Physics, Chemistry, Maths)" },
      { value: "Science (PCB)", label: "Science – PCB (Physics, Chemistry, Biology)" },
      { value: "Science (PCMB)", label: "Science – PCMB (Physics, Chemistry, Maths & Biology)" },
      { value: "Commerce", label: "Commerce" },
      { value: "Arts", label: "Arts / Humanities" },
      { value: "Vocational", label: "Vocational" },
      { value: "Agriculture", label: "Agriculture (12th)" },
    ]
  },

  // ─────────────────────────────────────────────
  // LEVEL 3 — ITI
  // ─────────────────────────────────────────────
  {
    level: 3, name: "ITI", label: "ITI Certificate", branches: [
      { value: "Refrigeration and AC", label: "Refrigeration and AC" },
      { value: "Heat Engine", label: "Heat Engine" },
      { value: "Mechanic Diesel", label: "Mechanic Diesel" },
      { value: "Armature and Coil Winder", label: "Armature and Coil Winder" },
      { value: "Mechanic Motor Vehicle", label: "Mechanic Motor Vehicle" },
      { value: "Mechanic Radio and TV", label: "Mechanic Radio and TV" },
      { value: "Maintenance Mechanic", label: "Maintenance Mechanic" },
      { value: "Millwright", label: "Millwright" },
      // Electrical / Electronics
      { value: "Electrician", label: "Electrician" },
      { value: "Wireman", label: "Wireman" },
      { value: "Electronics Mechanic", label: "Electronics Mechanic" },
      { value: "Instrument Mechanic", label: "Instrument Mechanic" },
      { value: "Mechanic Consumer Electronics", label: "Mechanic Consumer Electronics" },
      { value: "Solar Technician", label: "Solar Technician" },
      { value: "Network Technician", label: "Network Technician" },
      // Mechanical / Fabrication
      { value: "Fitter", label: "Fitter" },
      { value: "Turner", label: "Turner" },
      { value: "Machinist", label: "Machinist" },
      { value: "Welder", label: "Welder" },
      { value: "Sheet Metal Worker", label: "Sheet Metal Worker" },
      { value: "Foundry Man", label: "Foundry Man" },
      { value: "Blacksmith", label: "Blacksmith" },
      { value: "Electroplater", label: "Electroplater" },
      { value: "Tool and Die Maker", label: "Tool and Die Maker" },
      { value: "Mechanic Machine Tools Maintenance", label: "Mechanic Machine Tools Maintenance" },
      // Automobile / Motor
      { value: "Motor Mechanic", label: "Motor Mechanic Vehicle (MMV)" },
      { value: "Diesel Mechanic", label: "Diesel Mechanic" },
      { value: "Tractor Mechanic", label: "Tractor Mechanic" },
      { value: "Mechanic Two Wheeler", label: "Mechanic Two Wheeler" },
      // AC / Refrigeration
      { value: "Refrigeration and AC Mechanic", label: "Refrigeration & AC Mechanic" },
      // Civil / Construction
      { value: "Draughtsman Civil", label: "Draughtsman Civil" },
      { value: "Mason", label: "Mason (Construction)" },
      { value: "Plumber", label: "Plumber" },
      { value: "Carpenter", label: "Carpenter" },
      { value: "Painter", label: "Painter" },
      { value: "Surveyor", label: "Surveyor" },
      { value: "Interior Decoration", label: "Interior Decoration & Design" },
      // Mechanical Draughting
      { value: "Draughtsman Mechanical", label: "Draughtsman Mechanical" },
      // IT / Computer
      { value: "COPA", label: "COPA (Computer Operator & Programming)" },
      { value: "Mechanic Computer Hardware", label: "Mechanic Computer Hardware & Networking" },
      { value: "IT and ITES", label: "IT & ITES" },
      // Textile / Leather
      { value: "Rubber Technician", label: "Rubber Technician" },
      { value: "Leather Goods Maker", label: "Leather Goods Maker" },
      { value: "Cutting and Sewing", label: "Cutting and Sewing" },
      { value: "Dress Making", label: "Dress Making" },
      { value: "Embroidery", label: "Embroidery and Needle Work" },
      // Printing / Publishing
      { value: "Book Binder", label: "Book Binder" },
      { value: "Printing Technology", label: "Printing Technology" },
      // Others
      { value: "Stenographer", label: "Stenographer (English/Hindi)" },
      { value: "Photographer", label: "Photographer" },
      { value: "Physiotherapy Technician", label: "Physiotherapy Technician" },
      { value: "Radiology Technician", label: "Radiology Technician" },
      { value: "Health Sanitary Inspector", label: "Health Sanitary Inspector" },
      { value: "Bleaching and Dyeing", label: "Bleaching and Dyeing Calico Print" },
      { value: "Hair and Skin Care", label: "Hair and Skin Care (Cosmetology)" },
      { value: "Food Production", label: "Food Production (General)" },
      { value: "Bakery and Confectionery", label: "Bakery and Confectionery" },
      { value: "Horticulture", label: "Horticulture" },
      { value: "Fireman", label: "Fireman" },
      { value: "Lift Mechanic", label: "Lift and Escalator Mechanic" },
    ]
  },

  // ─────────────────────────────────────────────
  // LEVEL 3 — Diploma / Polytechnic
  // ─────────────────────────────────────────────
  {
    level: 3, name: "Diploma", label: "Diploma / Polytechnic", branches: [
      { value: "Electronics", label: "Electronics" },
      // Engineering
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
      { value: "Metallurgy", label: "Metallurgy Engineering" },
      { value: "Environmental Engineering", label: "Environmental Engineering" },
      { value: "Public Health Engineering", label: "Public Health Engineering" },
      { value: "Agricultural Engineering", label: "Agricultural Engineering" },
      { value: "Marine Engineering", label: "Marine Engineering" },
      { value: "Aerospace", label: "Aeronautical / Aerospace Engineering" },
      { value: "Architecture", label: "Architecture & Town Planning" },
      { value: "Interior Design", label: "Interior Design" },
      // Health / Paramedical
      { value: "Pharmacy", label: "Pharmacy (D.Pharm)" },
      { value: "Medical Lab Technology", label: "Medical Lab Technology (DMLT)" },
      { value: "Radiology and Imaging", label: "Radiology & Imaging Technology" },
      { value: "Operation Theatre", label: "Operation Theatre Technology" },
      { value: "Physiotherapy", label: "Physiotherapy (Diploma)" },
      { value: "Optometry", label: "Optometry" },
      { value: "Dental Mechanics", label: "Dental Mechanics / Dental Technology" },
      { value: "Dialysis Technology", label: "Dialysis Technology" },
      { value: "Cardiac Technology", label: "Cardiac & Perfusion Technology" },
      { value: "Nutrition and Dietetics", label: "Nutrition & Dietetics" },
      { value: "Medical Records", label: "Medical Records & Health Information" },
      // Management / Hospitality
      { value: "Hotel Management", label: "Hotel Management & Catering" },
      { value: "Travel and Tourism", label: "Travel & Tourism Management" },
      { value: "Retail Management", label: "Retail Management" },
      // Creative / Design
      { value: "Fashion Design", label: "Fashion Design & Technology" },
      { value: "Graphic Design", label: "Graphic Design & Multimedia" },
      { value: "Printing Technology", label: "Printing Technology" },
      // Agriculture / Allied
      { value: "Agriculture", label: "Agriculture (Diploma)" },
      { value: "Horticulture", label: "Horticulture (Diploma)" },
      { value: "Forestry", label: "Forestry (Diploma)" },
      { value: "Dairy Technology", label: "Dairy Technology (Diploma)" },
      { value: "Food Technology", label: "Food Technology (Diploma)" },
      // Others
      { value: "Library Science", label: "Library Science (Diploma)" },
      { value: "Mass Communication", label: "Mass Communication & Journalism" },
      { value: "Physical Education", label: "Physical Education (Diploma)" },
      { value: "Fire and Safety", label: "Fire & Industrial Safety" },
      { value: "Computer Applications", label: "Computer Applications (DCA / PGDCA)" },
    ]
  },

  // ─────────────────────────────────────────────
  // LEVEL 3 — Standalone Medical / Paramedical
  // ─────────────────────────────────────────────
  { level: 3, name: "GNM", label: "GNM (General Nursing & Midwifery)", branches: [] },
  { level: 3, name: "ANM", label: "ANM (Auxiliary Nurse Midwife)", branches: [] },
  { level: 3, name: "D.Pharm", label: "D.Pharm (Diploma in Pharmacy)", branches: [] },

  // ─────────────────────────────────────────────
  // LEVEL 4 — Graduation / Bachelor's
  // ─────────────────────────────────────────────

  // Engineering
  {
    level: 4, name: "B.Tech", label: "B.Tech / BE (Engineering)", branches: [
      { value: "Electronics", label: "Electronics" },
      { value: "CSE", label: "Computer Science & Engineering (CSE)" },
      { value: "IT", label: "Information Technology (IT)" },
      { value: "Mechanical", label: "Mechanical Engineering" },
      { value: "Civil", label: "Civil Engineering" },
      { value: "Electrical", label: "Electrical Engineering" },
      { value: "EEE", label: "Electrical & Electronics Engineering (EEE)" },
      { value: "ECE", label: "Electronics & Communication Engineering (ECE)" },
      { value: "Chemical", label: "Chemical Engineering" },
      { value: "Aerospace", label: "Aerospace / Aeronautical Engineering" },
      { value: "Automobile", label: "Automobile Engineering" },
      { value: "Production", label: "Production / Manufacturing Engineering" },
      { value: "Industrial", label: "Industrial Engineering" },
      { value: "Instrumentation", label: "Instrumentation Engineering" },
      { value: "Mining", label: "Mining Engineering" },
      { value: "Metallurgy", label: "Metallurgy / Materials Engineering" },
      { value: "Biotechnology", label: "Biotechnology Engineering" },
      { value: "Environmental Engineering", label: "Environmental Engineering" },
      { value: "Marine", label: "Marine Engineering" },
      { value: "Textile", label: "Textile Engineering / Technology" },
      { value: "AI", label: "Artificial Intelligence (AI)" },
      { value: "Data Science", label: "Data Science & Engineering" },
      { value: "Cyber Security", label: "Cyber Security" },
      { value: "Software Engineering", label: "Software Engineering" },
      { value: "Network Engineering", label: "Network Engineering / Telecom" },
      { value: "VLSI", label: "VLSI Design / Microelectronics" },
      { value: "Embedded Systems", label: "Embedded Systems" },
      { value: "Robotics", label: "Robotics & Automation" },
      { value: "Petroleum", label: "Petroleum Engineering" },
      { value: "Nuclear", label: "Nuclear Engineering" },
      { value: "Agricultural Engineering", label: "Agricultural Engineering" },
      { value: "Biomedical", label: "Biomedical Engineering" },
      { value: "Food Technology", label: "Food Technology / Processing" },
      { value: "Nanotechnology", label: "Nanotechnology" },
      { value: "Cloud Computing", label: "Cloud Computing" },
      { value: "IoT", label: "Internet of Things (IoT)" },
      { value: "Construction Technology", label: "Construction Technology & Management" },
      { value: "Geo-informatics", label: "Geo-informatics / Geomatics" },
      { value: "Architecture Engineering", label: "Architecture Engineering" },
    ]
  },

  // Science
  {
    level: 4, name: "B.Sc", label: "B.Sc (Science)", branches: [
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Mathematics", label: "Mathematics" },
      { value: "Statistics", label: "Statistics" },
      { value: "Biology", label: "Biology / Life Sciences" },
      { value: "Zoology", label: "Zoology / Animal Science" },
      { value: "Botany", label: "Botany / Plant Science" },
      { value: "Microbiology", label: "Microbiology" },
      { value: "Biochemistry", label: "Biochemistry" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Environmental Science", label: "Environmental Science" },
      { value: "Geology", label: "Geology / Earth Science" },
      { value: "Geography", label: "Geography" },
      { value: "Computer Science", label: "Computer Science (B.Sc CS)" },
      { value: "Electronics", label: "Electronics (B.Sc)" },
      { value: "Forensic Science", label: "Forensic Science" },
      { value: "Agriculture", label: "Agriculture" },
      { value: "Horticulture", label: "Horticulture" },
      { value: "Genetics", label: "Genetics / Molecular Biology" },
      { value: "Neuroscience", label: "Neuroscience" },
      { value: "Astronomy", label: "Astronomy / Astrophysics" },
      { value: "Oceanography", label: "Oceanography / Marine Science" },
      { value: "Atmospheric Science", label: "Atmospheric Science / Meteorology" },
      { value: "Food Science", label: "Food Science & Technology" },
      { value: "Dairy Science", label: "Dairy Science / Technology" },
      { value: "Fisheries Science", label: "Fisheries Science" },
      { value: "Sericulture", label: "Sericulture" },
      { value: "Forestry", label: "Forestry" },
      { value: "Veterinary Science", label: "Veterinary Science (B.Sc)" },
      { value: "Industrial Chemistry", label: "Industrial Chemistry" },
      { value: "Medical Imaging", label: "Medical Imaging Technology" },
      { value: "Physiotherapy", label: "Physiotherapy (B.Sc)" },
      { value: "Optometry", label: "Optometry (B.Sc)" },
      { value: "Cardiac Technology", label: "Cardiac Technology" },
      { value: "Dialysis Technology", label: "Dialysis Technology" },
      { value: "Operation Theatre", label: "Operation Theatre Technology" },
      { value: "Medical Lab Technology", label: "Medical Lab Technology (B.Sc MLT)" },
      { value: "Nursing", label: "Nursing (B.Sc Nursing)" },
      { value: "Anaesthesia Technology", label: "Anaesthesia Technology" },
    ]
  },

  // Arts / Humanities
  {
    level: 4, name: "BA", label: "BA (Arts / Humanities)", branches: [
      // Social Sciences
      { value: "Economics", label: "Economics" },
      { value: "History", label: "History" },
      { value: "Political Science", label: "Political Science" },
      { value: "Sociology", label: "Sociology" },
      { value: "Psychology", label: "Psychology" },
      { value: "Public Administration", label: "Public Administration" },
      { value: "Social Work", label: "Social Work" },
      { value: "Anthropology", label: "Anthropology" },
      { value: "Geography", label: "Geography" },
      { value: "Philosophy", label: "Philosophy" },
      { value: "International Relations", label: "International Relations" },
      { value: "Defence Studies", label: "Defence Studies" },
      // Languages
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
      { value: "Assamese", label: "Assamese" },
      { value: "Kashmiri", label: "Kashmiri" },
      { value: "Nepali", label: "Nepali" },
      { value: "Manipuri", label: "Manipuri / Meitei" },
      { value: "Maithili", label: "Maithili" },
      { value: "Bodo", label: "Bodo" },
      { value: "Konkani", label: "Konkani" },
      { value: "Sindhi", label: "Sindhi" },
      { value: "Dogri", label: "Dogri" },
      { value: "French", label: "French" },
      { value: "German", label: "German" },
      { value: "Arabic", label: "Arabic" },
      { value: "Persian", label: "Persian" },
      // Media / Arts / Education
      { value: "Journalism", label: "Journalism / Mass Communication" },
      { value: "Education", label: "Education" },
      { value: "Physical Education", label: "Physical Education" },
      { value: "Library Science", label: "Library Science" },
      { value: "Fine Arts", label: "Fine Arts / Visual Arts" },
      { value: "Music", label: "Music" },
      { value: "Dance", label: "Dance / Performing Arts" },
      { value: "Theatre Arts", label: "Theatre & Performing Arts" },
      { value: "Film Studies", label: "Film Studies / Media" },
      // Other Humanities
      { value: "Archaeology", label: "Archaeology" },
      { value: "Museum Studies", label: "Museum Studies" },
      { value: "Rural Development", label: "Rural Development" },
      { value: "Development Studies", label: "Development Studies" },
      { value: "Environmental Studies", label: "Environmental Studies (BA)" },
    ]
  },

  // Commerce
  {
    level: 4, name: "B.Com", label: "B.Com (Commerce)", branches: [
      { value: "Accounting", label: "Accounting & Finance" },
      { value: "Finance", label: "Finance" },
      { value: "Banking", label: "Banking & Insurance" },
      { value: "Taxation", label: "Taxation" },
      { value: "Marketing", label: "Marketing" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "International Business", label: "International Business" },
      { value: "E-Commerce", label: "E-Commerce" },
      { value: "Computer Applications", label: "Computer Applications (B.Com CA)" },
    ]
  },

  // Computer Applications
  {
    level: 4, name: "BCA", label: "BCA (Computer Applications)", branches: [
      { value: "Computer Applications", label: "Computer Applications" },
      { value: "AI and Data Science", label: "AI & Data Science (BCA)" },
      { value: "Cloud Computing", label: "Cloud Computing (BCA)" },
      { value: "Cyber Security", label: "Cyber Security (BCA)" },
    ]
  },

  // Business Administration
  {
    level: 4, name: "BBA", label: "BBA / BBM (Business Administration)", branches: [
      { value: "Business Administration", label: "Business Administration (General)" },
      { value: "Marketing", label: "Marketing" },
      { value: "Finance", label: "Finance" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "Operations", label: "Operations & Supply Chain" },
      { value: "Information Technology", label: "IT Management" },
      { value: "Hospital Management", label: "Hospital Management" },
      { value: "Aviation Management", label: "Aviation Management" },
      { value: "Hotel Management", label: "Hotel / Hospitality Management" },
      { value: "Tourism Management", label: "Tourism & Travel Management" },
      { value: "International Business", label: "International Business" },
      { value: "Retail Management", label: "Retail Management" },
      { value: "Agribusiness", label: "Agribusiness Management" },
      { value: "Event Management", label: "Event Management" },
      { value: "Entrepreneurship", label: "Entrepreneurship" },
    ]
  },

  // Pharmacy
  {
    level: 4, name: "B.Pharm", label: "B.Pharm (Pharmacy)", branches: [
      { value: "Pharmacy", label: "Pharmacy" },
      { value: "Pharmaceutical Sciences", label: "Pharmaceutical Sciences" },
      { value: "Industrial Pharmacy", label: "Industrial Pharmacy" },
      { value: "Pharmacology", label: "Pharmacology" },
    ]
  },

  // Medical / Health (no branches — standalone degrees)
  { level: 4, name: "MBBS", label: "MBBS (Medicine & Surgery)", branches: [] },
  { level: 4, name: "BDS", label: "BDS (Dental Surgery)", branches: [] },
  { level: 4, name: "BAMS", label: "BAMS (Ayurvedic Medicine & Surgery)", branches: [] },
  { level: 4, name: "BHMS", label: "BHMS (Homeopathic Medicine)", branches: [] },
  { level: 4, name: "BUMS", label: "BUMS (Unani Medicine & Surgery)", branches: [] },
  { level: 4, name: "BSMS", label: "BSMS (Siddha Medicine & Surgery)", branches: [] },
  { level: 4, name: "BNYS", label: "BNYS (Naturopathy & Yogic Sciences)", branches: [] },
  { level: 4, name: "BPT", label: "BPT (Physiotherapy)", branches: [] },
  { level: 4, name: "BOT", label: "BOT (Occupational Therapy)", branches: [] },
  { level: 4, name: "BMLT", label: "BMLT (Medical Lab Technology)", branches: [] },
  {
    level: 4, name: "B.Sc Nursing", label: "B.Sc Nursing", branches: [
      { value: "Nursing", label: "Nursing" },
      { value: "Post Basic Nursing", label: "Post Basic B.Sc Nursing" },
    ]
  },

  // Law
  {
    level: 4, name: "LLB", label: "LLB / BA LLB (Law)", branches: [
      { value: "Law", label: "Law (General)" },
      { value: "Corporate Law", label: "Corporate Law" },
      { value: "Criminal Law", label: "Criminal Law" },
      { value: "Constitutional Law", label: "Constitutional Law" },
      { value: "International Law", label: "International Law" },
      { value: "Cyber Law", label: "Cyber Law" },
      { value: "Intellectual Property", label: "Intellectual Property Law" },
      { value: "Labour Law", label: "Labour & Industrial Law" },
    ]
  },

  // Education
  {
    level: 4, name: "B.Ed", label: "B.Ed (Education)", branches: [
      { value: "Education", label: "Education (General)" },
      { value: "Special Education", label: "Special Education" },
      { value: "Physical Education", label: "Physical Education (B.P.Ed)" },
    ]
  },

  // Architecture
  {
    level: 4, name: "B.Arch", label: "B.Arch (Architecture)", branches: [
      { value: "Architecture", label: "Architecture" },
      { value: "Urban Planning", label: "Urban & Regional Planning" },
      { value: "Interior Architecture", label: "Interior Architecture" },
      { value: "Landscape Architecture", label: "Landscape Architecture" },
    ]
  },

  // Agriculture (standalone degree)
  {
    level: 4, name: "B.Sc Agriculture", label: "B.Sc Agriculture", branches: [
      { value: "Agronomy", label: "Agronomy" },
      { value: "Horticulture", label: "Horticulture" },
      { value: "Plant Pathology", label: "Plant Pathology" },
      { value: "Soil Science", label: "Soil Science" },
      { value: "Genetics and Plant Breeding", label: "Genetics & Plant Breeding" },
      { value: "Agricultural Economics", label: "Agricultural Economics" },
      { value: "Agricultural Extension", label: "Agricultural Extension" },
      { value: "Entomology", label: "Entomology" },
      { value: "Biochemistry", label: "Agricultural Biochemistry" },
      { value: "Agribusiness", label: "Agribusiness Management" },
    ]
  },

  // Veterinary
  {
    level: 4, name: "B.V.Sc", label: "B.V.Sc & AH (Veterinary Science)", branches: [
      { value: "Veterinary Science", label: "Veterinary Science" },
      { value: "Animal Husbandry", label: "Animal Husbandry" },
    ]
  },

  // Fisheries
  {
    level: 4, name: "B.F.Sc", label: "B.F.Sc (Fisheries Science)", branches: [
      { value: "Fisheries Science", label: "Fisheries Science" },
      { value: "Aquaculture", label: "Aquaculture" },
    ]
  },

  // Hotel / Hospitality
  {
    level: 4, name: "B.H.M", label: "BHM / BHMCT (Hotel Management)", branches: [
      { value: "Hotel Management", label: "Hotel Management" },
      { value: "Culinary Arts", label: "Culinary Arts" },
      { value: "Hospitality Management", label: "Hospitality Management" },
      { value: "Food and Beverage", label: "Food & Beverage Management" },
    ]
  },

  // Fine / Performing Arts
  {
    level: 4, name: "BFA", label: "BFA (Fine Arts)", branches: [
      { value: "Fine Arts", label: "Fine Arts" },
      { value: "Applied Arts", label: "Applied Arts" },
      { value: "Sculpture", label: "Sculpture" },
      { value: "Painting", label: "Painting" },
      { value: "Printmaking", label: "Printmaking" },
      { value: "Graphic Arts", label: "Graphic Arts" },
    ]
  },

  // Mass Communication
  {
    level: 4, name: "BJMC", label: "BJMC / BMC (Mass Communication)", branches: [
      { value: "Journalism", label: "Journalism" },
      { value: "Mass Communication", label: "Mass Communication" },
      { value: "Advertising", label: "Advertising & PR" },
      { value: "Digital Media", label: "Digital Media" },
      { value: "Electronic Media", label: "Electronic Media / Broadcasting" },
    ]
  },

  // Social Work
  {
    level: 4, name: "BSW", label: "BSW (Social Work)", branches: [
      { value: "Social Work", label: "Social Work" },
      { value: "Community Development", label: "Community Development" },
      { value: "Medical Social Work", label: "Medical & Psychiatric Social Work" },
    ]
  },

  // Library Science
  {
    level: 4, name: "B.Lib", label: "B.Lib.I.Sc (Library Science)", branches: [
      { value: "Library Science", label: "Library & Information Science" },
    ]
  },

  // Physical Education
  {
    level: 4, name: "B.P.Ed", label: "B.P.Ed (Physical Education)", branches: [
      { value: "Physical Education", label: "Physical Education" },
      { value: "Sports Science", label: "Sports Science" },
      { value: "Yoga", label: "Yoga Education" },
    ]
  },

  // Design
  {
    level: 4, name: "B.Des", label: "B.Des (Design)", branches: [
      { value: "Fashion Design", label: "Fashion Design" },
      { value: "Interior Design", label: "Interior Design" },
      { value: "Graphic Design", label: "Graphic Design / Visual Communication" },
      { value: "Industrial Design", label: "Industrial / Product Design" },
      { value: "UI/UX Design", label: "UI/UX / Interaction Design" },
      { value: "Textile Design", label: "Textile / Apparel Design" },
      { value: "Animation", label: "Animation & Multimedia" },
    ]
  },

  // Professional Degrees
  { level: 4, name: "CA", label: "CA (Chartered Accountant)", branches: [{ value: "CA", label: "Chartered Accountancy" }] },
  { level: 4, name: "CS", label: "CS (Company Secretary)", branches: [{ value: "CS", label: "Company Secretaryship" }] },
  { level: 4, name: "CMA", label: "CMA / ICWA (Cost Accountant)", branches: [{ value: "CMA", label: "Cost & Management Accountancy" }] },

  // ─────────────────────────────────────────────
  // LEVEL 5 — Post-Graduation / Master's
  // ─────────────────────────────────────────────

  // Engineering PG
  {
    level: 5, name: "M.Tech", label: "M.Tech / ME (Engineering PG)", branches: [
      { value: "CSE", label: "Computer Science & Engineering" },
      { value: "IT", label: "Information Technology" },
      { value: "Mechanical", label: "Mechanical Engineering" },
      { value: "Civil", label: "Civil Engineering" },
      { value: "Structural", label: "Structural Engineering" },
      { value: "Electrical", label: "Electrical Engineering" },
      { value: "ECE", label: "Electronics & Communication" },
      { value: "EEE", label: "Electrical & Electronics" },
      { value: "Chemical", label: "Chemical Engineering" },
      { value: "Environmental Engineering", label: "Environmental Engineering" },
      { value: "AI", label: "AI / Machine Learning" },
      { value: "Data Science", label: "Data Science" },
      { value: "VLSI", label: "VLSI Design" },
      { value: "Embedded Systems", label: "Embedded Systems" },
      { value: "Power Systems", label: "Power Systems & Energy" },
      { value: "Thermal Engineering", label: "Thermal Engineering" },
      { value: "Production", label: "Production / Manufacturing" },
      { value: "Geotechnical", label: "Geotechnical Engineering" },
      { value: "Transportation", label: "Transportation Engineering" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Nanotechnology", label: "Nanotechnology" },
      { value: "Aerospace", label: "Aerospace Engineering" },
      { value: "Nuclear", label: "Nuclear Engineering" },
      { value: "Cyber Security", label: "Cyber Security" },
      { value: "Cloud Computing", label: "Cloud Computing" },
      { value: "Software Engineering", label: "Software Engineering" },
      { value: "Construction Management", label: "Construction Management" },
      { value: "Remote Sensing", label: "Remote Sensing & GIS" },
    ]
  },

  // Management PG
  {
    level: 5, name: "MBA", label: "MBA / PGDM (Management PG)", branches: [
      { value: "Business Administration", label: "General Management" },
      { value: "Finance", label: "Finance & Accounting" },
      { value: "Marketing", label: "Marketing & Sales" },
      { value: "Human Resource", label: "Human Resource Management" },
      { value: "Operations", label: "Operations & Supply Chain" },
      { value: "Information Technology", label: "IT & Systems Management" },
      { value: "Hospital Management", label: "Hospital & Health Management" },
      { value: "International Business", label: "International Business" },
      { value: "Rural Management", label: "Rural & Agribusiness Management" },
      { value: "Banking and Finance", label: "Banking & Financial Services" },
      { value: "Entrepreneurship", label: "Entrepreneurship & Innovation" },
      { value: "Logistics", label: "Logistics & Supply Chain" },
      { value: "Hotel Management", label: "Hotel & Hospitality Management (MBA)" },
      { value: "Aviation Management", label: "Aviation Management (MBA)" },
      { value: "Retail Management", label: "Retail Management (MBA)" },
      { value: "Public Policy", label: "Public Policy & Administration" },
    ]
  },

  // Science PG
  {
    level: 5, name: "M.Sc", label: "M.Sc (Science PG)", branches: [
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Mathematics", label: "Mathematics" },
      { value: "Statistics", label: "Statistics" },
      { value: "Biology", label: "Biology / Life Sciences" },
      { value: "Zoology", label: "Zoology" },
      { value: "Botany", label: "Botany" },
      { value: "Microbiology", label: "Microbiology" },
      { value: "Biochemistry", label: "Biochemistry" },
      { value: "Biotechnology", label: "Biotechnology" },
      { value: "Computer Science", label: "Computer Science" },
      { value: "Environmental Science", label: "Environmental Science" },
      { value: "Forensic Science", label: "Forensic Science" },
      { value: "Geology", label: "Geology / Earth Science" },
      { value: "Geography", label: "Geography" },
      { value: "Genetics", label: "Genetics / Molecular Biology" },
      { value: "Neuroscience", label: "Neuroscience" },
      { value: "Astronomy", label: "Astronomy / Astrophysics" },
      { value: "Oceanography", label: "Oceanography" },
      { value: "Atmospheric Science", label: "Atmospheric Science / Meteorology" },
      { value: "Food Technology", label: "Food Technology / Science" },
      { value: "Agriculture", label: "Agriculture Science (M.Sc)" },
      { value: "Horticulture", label: "Horticulture (M.Sc)" },
      { value: "Electronics", label: "Electronics (M.Sc)" },
      { value: "Industrial Chemistry", label: "Industrial / Applied Chemistry" },
      { value: "Data Science", label: "Data Science & Analytics" },
      { value: "AI", label: "Artificial Intelligence (M.Sc)" },
      { value: "Bioinformatics", label: "Bioinformatics" },
    ]
  },

  // Arts PG
  {
    level: 5, name: "MA", label: "MA (Arts / Humanities PG)", branches: [
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
      { value: "Tamil", label: "Tamil" },
      { value: "Telugu", label: "Telugu" },
      { value: "Kannada", label: "Kannada" },
      { value: "Malayalam", label: "Malayalam" },
      { value: "Bengali", label: "Bengali" },
      { value: "Marathi", label: "Marathi" },
      { value: "Odia", label: "Odia" },
      { value: "Punjabi", label: "Punjabi" },
      { value: "Gujarati", label: "Gujarati" },
      { value: "Journalism", label: "Journalism / Mass Communication" },
      { value: "Anthropology", label: "Anthropology" },
      { value: "Geography", label: "Geography" },
      { value: "Philosophy", label: "Philosophy" },
      { value: "International Relations", label: "International Relations" },
      { value: "Defence Studies", label: "Defence Studies" },
      { value: "Education", label: "Education (MA)" },
      { value: "Library Science", label: "Library Science (MA)" },
      { value: "Physical Education", label: "Physical Education (MA)" },
      { value: "Development Studies", label: "Development Studies" },
      { value: "Rural Development", label: "Rural Development" },
      { value: "Fine Arts", label: "Fine Arts (MA)" },
      { value: "Music", label: "Music (MA)" },
      { value: "Dance", label: "Dance / Performing Arts (MA)" },
      { value: "Archaeology", label: "Archaeology" },
    ]
  },

  // Commerce PG
  {
    level: 5, name: "M.Com", label: "M.Com (Commerce PG)", branches: [
      { value: "Accounting", label: "Accounting & Finance" },
      { value: "Finance", label: "Finance" },
      { value: "Taxation", label: "Taxation" },
      { value: "Banking", label: "Banking & Insurance" },
      { value: "Marketing", label: "Marketing" },
      { value: "Human Resource", label: "Human Resource" },
      { value: "International Business", label: "International Business" },
      { value: "E-Commerce", label: "E-Commerce" },
    ]
  },

  // Computer Applications PG
  {
    level: 5, name: "MCA", label: "MCA (Computer Applications PG)", branches: [
      { value: "Computer Applications", label: "Computer Applications" },
      { value: "AI and Data Science", label: "AI & Data Science (MCA)" },
      { value: "Cyber Security", label: "Cyber Security (MCA)" },
      { value: "Cloud Computing", label: "Cloud Computing (MCA)" },
      { value: "Software Engineering", label: "Software Engineering (MCA)" },
    ]
  },

  // Law PG
  {
    level: 5, name: "LLM", label: "LLM (Law PG)", branches: [
      { value: "Law PG", label: "Law (General)" },
      { value: "Corporate Law", label: "Corporate Law" },
      { value: "Constitutional Law", label: "Constitutional Law" },
      { value: "Criminal Law", label: "Criminal Law" },
      { value: "International Law", label: "International Law" },
      { value: "Intellectual Property", label: "Intellectual Property Law" },
      { value: "Human Rights Law", label: "Human Rights Law" },
      { value: "Labour Law", label: "Labour & Industrial Law" },
      { value: "Cyber Law", label: "Cyber Law" },
    ]
  },

  // Education PG
  {
    level: 5, name: "M.Ed", label: "M.Ed (Education PG)", branches: [
      { value: "Education", label: "Education" },
      { value: "Special Education", label: "Special Education" },
      { value: "Educational Technology", label: "Educational Technology" },
      { value: "Curriculum and Instruction", label: "Curriculum & Instruction" },
    ]
  },

  // Pharmacy PG
  {
    level: 5, name: "M.Pharm", label: "M.Pharm (Pharmacy PG)", branches: [
      { value: "Pharmaceutics", label: "Pharmaceutics" },
      { value: "Pharmacology", label: "Pharmacology" },
      { value: "Pharmaceutical Chemistry", label: "Pharmaceutical Chemistry" },
      { value: "Pharmacognosy", label: "Pharmacognosy" },
      { value: "Clinical Pharmacy", label: "Clinical Pharmacy" },
      { value: "Pharmacy Practice", label: "Pharmacy Practice" },
      { value: "Industrial Pharmacy", label: "Industrial Pharmacy" },
      { value: "Quality Assurance", label: "Quality Assurance" },
    ]
  },

  // Architecture PG
  {
    level: 5, name: "M.Arch", label: "M.Arch (Architecture PG)", branches: [
      { value: "Architecture", label: "Architecture" },
      { value: "Urban Design", label: "Urban Design" },
      { value: "Urban Planning", label: "Urban & Regional Planning" },
      { value: "Landscape Architecture", label: "Landscape Architecture" },
      { value: "Interior Architecture", label: "Interior Architecture" },
      { value: "Building Technology", label: "Building Technology" },
    ]
  },

  // Agriculture PG
  {
    level: 5, name: "M.Sc Agriculture", label: "M.Sc Agriculture", branches: [
      { value: "Agronomy", label: "Agronomy" },
      { value: "Horticulture", label: "Horticulture" },
      { value: "Plant Pathology", label: "Plant Pathology" },
      { value: "Soil Science", label: "Soil Science" },
      { value: "Genetics and Plant Breeding", label: "Genetics & Plant Breeding" },
      { value: "Agricultural Economics", label: "Agricultural Economics" },
      { value: "Agricultural Extension", label: "Agricultural Extension" },
      { value: "Entomology", label: "Entomology" },
      { value: "Agricultural Biotechnology", label: "Agricultural Biotechnology" },
      { value: "Post Harvest Technology", label: "Post Harvest Technology" },
      { value: "Agribusiness", label: "Agribusiness Management" },
    ]
  },

  // Social Work PG
  {
    level: 5, name: "MSW", label: "MSW (Master of Social Work)", branches: [
      { value: "Social Work", label: "Social Work" },
      { value: "Community Development", label: "Community Development" },
      { value: "Medical Social Work", label: "Medical & Psychiatric Social Work" },
      { value: "Rural Development", label: "Rural Development" },
      { value: "Labour Welfare", label: "Labour Welfare & Personnel Management" },
      { value: "Criminology", label: "Criminology & Correctional Administration" },
    ]
  },

  // Library Science PG
  {
    level: 5, name: "M.Lib", label: "M.Lib.I.Sc (Library Science PG)", branches: [
      { value: "Library Science", label: "Library & Information Science" },
    ]
  },

  // Physical Education PG
  {
    level: 5, name: "M.P.Ed", label: "M.P.Ed (Physical Education PG)", branches: [
      { value: "Physical Education", label: "Physical Education" },
      { value: "Sports Science", label: "Sports Science & Coaching" },
      { value: "Yoga", label: "Yoga Sciences" },
    ]
  },

  // Fine Arts PG
  {
    level: 5, name: "MFA", label: "MFA (Fine Arts PG)", branches: [
      { value: "Fine Arts", label: "Fine Arts" },
      { value: "Applied Arts", label: "Applied Arts" },
      { value: "Sculpture", label: "Sculpture" },
      { value: "Painting", label: "Painting" },
      { value: "Graphic Arts", label: "Graphic Arts" },
    ]
  },

  // Mass Communication PG
  {
    level: 5, name: "MJMC", label: "MJMC / MMC (Mass Communication PG)", branches: [
      { value: "Journalism", label: "Journalism" },
      { value: "Mass Communication", label: "Mass Communication" },
      { value: "Advertising", label: "Advertising & PR" },
      { value: "Digital Media", label: "Digital Media" },
      { value: "Electronic Media", label: "Electronic Media" },
    ]
  },

  // Design PG
  {
    level: 5, name: "M.Des", label: "M.Des (Design PG)", branches: [
      { value: "Fashion Design", label: "Fashion Design" },
      { value: "Interior Design", label: "Interior Design" },
      { value: "Industrial Design", label: "Industrial / Product Design" },
      { value: "Graphic Design", label: "Graphic Design" },
      { value: "UI/UX Design", label: "UI/UX Design" },
      { value: "Animation", label: "Animation & Multimedia" },
    ]
  },

  // Medical PG (standalone PG medical degrees)
  { level: 5, name: "MD", label: "MD (Doctor of Medicine)", branches: [] },
  { level: 5, name: "MS", label: "MS (Master of Surgery)", branches: [] },
  { level: 5, name: "MDS", label: "MDS (Master of Dental Surgery)", branches: [] },
  { level: 5, name: "MPT", label: "MPT (Master of Physiotherapy)", branches: [] },
  { level: 5, name: "MOT", label: "MOT (Master of Occupational Therapy)", branches: [] },
  { level: 5, name: "MPH", label: "MPH (Master of Public Health)", branches: [] },

  // ─────────────────────────────────────────────
  // LEVEL 6 — PhD / Doctorate
  // ─────────────────────────────────────────────
  { level: 6, name: "PhD", label: "PhD / Doctorate", branches: [] },
];

export const LEVEL_GROUPS = [
  { id: 1, label: "10th / Matriculation", levels: [1] },
  { id: 2, label: "12th / Intermediate", levels: [2] },
  { id: 3, label: "Diploma, ITI & Paramedical", levels: [3] },
  { id: 4, label: "Graduation (Bachelor's)", levels: [4] },
  { id: 5, label: "Post-Graduation (Master's)", levels: [5] },
  { id: 6, label: "PhD / Research", levels: [6] },
];
