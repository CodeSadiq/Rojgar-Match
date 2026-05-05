import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: String,
  avatar: String,
  profile: mongoose.Schema.Types.Mixed,
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Purge cache in development so Next.js picks up changes seamlessly
if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
