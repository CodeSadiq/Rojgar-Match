import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalVacancy: { type: Number },
  minQualificationLevel: { type: Number },
  prerequisite: [String],
  educationRequirementForMatch: mongoose.Schema.Types.Mixed,
  appearingEligible: { type: Boolean, default: false },
  appearingConditions: { type: String },
  qualificationNote: { type: String },
  qualification: mongoose.Schema.Types.Mixed,
  ageLimit: {
    min: Number,
    max: Number,
    asOnDate: String,
    relaxation: mongoose.Schema.Types.Mixed
  },
  salary: {
    payLevel: Number,
    min: Number,
    max: Number,
    currency: String
  },
  categoryWiseVacancy: {
    general: Number,
    ews: Number,
    obc: Number,
    sc: Number,
    st: Number,
    pwd: Number
  }
}, { _id: false, strict: false });

const JobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  advertisementNumber: { type: String },
  organization: { type: String, required: true },
  department: { type: String },
  type: { type: String },
  postNames: [{ type: String }],
  posts: [PostSchema],
  totalVacancy: { type: Number },
  categoryWiseVacancyTotal: {
    general: Number,
    ews: Number,
    obc: Number,
    sc: Number,
    st: Number,
    pwd: Number
  },
  qualification: mongoose.Schema.Types.Mixed,
  ageLimit: {
    min: Number,
    max: Number,
    asOnDate: String,
    relaxation: {
      obc: Number,
      sc: Number,
      st: Number,
      pwd: Number,
      exServiceman: Number,
      female: Number
    }
  },
  categoryEligibility: [String],
  pwdEligible: { type: Boolean, default: false },
  femaleOnly: { type: Boolean, default: false },
  exServicemanQuota: { type: Boolean, default: false },
  location: [String],
  salary: {
    payLevel: Number,
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  applicationFee: {
    general: Number,
    obc: Number,
    sc: Number,
    st: Number,
    pwd: Number,
    female: Number,
    exServiceman: Number,
    ews: Number,
    paymentMode: [String]
  },
  importantDates: {
    notificationType: String,
    notificationRelease: String,
    applicationStartDate: String,
    applicationLastDate: String,
    feePaymentLastDate: String,
    correctionWindowLastDate: String,
    admitCardDate: String,
    examDate: String,
    resultDate: String,
    interviewDate: String,
    documentVerificationDate: String,
    officialWebsite: String,
    applyOnline: String,
    applyLink: String,
    notificationPdfLink: String,
    checkResult: String
  },
  applicationProcess: [String],
  selectionProcess: [String],
  description: { type: String },
  shortInfo: { type: String },
  officialWebsite: { type: String },
  applyLink: { type: String },
  notificationPdfLink: { type: String },
  source: { type: String },
  tags: [String],
  notificationType: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

// ── INDEXES ──────────────────────────────────────────────────────────────────
JobSchema.index({ id: 1 }, { unique: true });
JobSchema.index({ type: 1, active: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ updatedAt: -1 });
// Purge cache in development so Next.js picks up changes seamlessly
if (process.env.NODE_ENV !== 'production' && mongoose.models.Job) {
  delete mongoose.models.Job;
}

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
