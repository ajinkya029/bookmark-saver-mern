import mongoose from 'mongoose';
const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  url: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  tags: [{ type: String, trim: true, lowercase: true }],
  favorite: { type: Boolean, default: false }
}, { timestamps: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model('Bookmark', bookmarkSchema);
