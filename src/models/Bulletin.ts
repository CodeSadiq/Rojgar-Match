import mongoose from 'mongoose';

const BulletinSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // e.g., 'Important', 'Admission', 'Admit Card', 'Syllabus', 'Result'
  text: { type: String, required: true },
  desc: { type: String },
  time: { type: String },
  links: [{
    title: { type: String },
    url: { type: String }
  }],
  routedTo: { type: String },
  tags: [String],
  active: { type: Boolean, default: true }
}, { timestamps: true });

// ── INDEXES ──────────────────────────────────────────────────────────────────
BulletinSchema.index({ id: 1 }, { unique: true });
BulletinSchema.index({ active: 1, createdAt: -1 });

// Purge cache in development so Next.js picks up changes seamlessly
if (process.env.NODE_ENV !== 'production' && mongoose.models.Bulletin) {
  delete mongoose.models.Bulletin;
}

export default mongoose.models.Bulletin || mongoose.model('Bulletin', BulletinSchema);
