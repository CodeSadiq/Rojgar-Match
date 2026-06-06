import mongoose from 'mongoose';

const BulletinCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  isStatic: { type: Boolean, default: false }
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production' && mongoose.models.BulletinCategory) {
  delete mongoose.models.BulletinCategory;
}

export default mongoose.models.BulletinCategory || mongoose.model('BulletinCategory', BulletinCategorySchema);
