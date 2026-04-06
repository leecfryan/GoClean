const mongoose = require('mongoose');

// Mirror of the auth service User schema (read-only view — no password/tokens here).
// The auth service owns identity; this service owns profile data.
const userSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    tier: {
      type: String,
      enum: ['normal', 'silver', 'gold', 'platinum'],
      default: 'normal',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
