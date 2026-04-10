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
  categoryWiseVacancy: {
    general: Number,
    ews: Number,
    obc: Number,
    sc: Number,
    st: Number,
    pwd: Number
  }
}, { _id: false });

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
    notificationRelease: String,
    startDate: String,
    lastDate: String,
    feePaymentLastDate: String,
    correctionWindowLastDate: String,
    admitCardDate: String,
    examDate: String,
    resultDate: String,
    interviewDate: String,
    documentVerificationDate: String
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

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
